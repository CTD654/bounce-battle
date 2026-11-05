import fs from 'node:fs';
import path from 'node:path';
import {pipeline} from 'node:stream/promises';
import {createHash} from 'node:crypto';
import yazl from 'yazl';
export async function zipDirectory(folder, output) {
  const archive = new yazl.ZipFile();
  const done = pipeline(archive.outputStream, fs.createWriteStream(output));
  const base = path.basename(folder);
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir,entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) archive.addFile(file,(base+'/'+path.relative(folder,file)).replaceAll('\\','/'));
    }
  }
  visit(folder);
  archive.end();
  await done;
  fs.writeFileSync(output+'.sha256',createHash('sha256').update(fs.readFileSync(output)).digest('hex')+'  '+path.basename(output)+'\n');
  console.log(JSON.stringify({zip:output,bytes:fs.statSync(output).size}));
}
