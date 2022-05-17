import * as fs from 'fs';
import * as parser from 'xml2json';

const trainAnnotationsDir = './data/train/annotations';
const trainImagesDir = './data/train/images';
const trainCsvFile = './data/train_data.csv';

const testAnnotationsDir = './data/test/annotations';
const testImagesDir = './data/test/images';
const testCsvFile = './data/test_data.csv';

convertToCsv(trainAnnotationsDir, trainImagesDir, trainCsvFile, false);
convertToCsv(testAnnotationsDir, testImagesDir, testCsvFile, true);

function convertToCsv(annotationsDir, imagesDir, csvOutput, isTest) {
  const csvFile = fs.createWriteStream(csvOutput);
  csvFile.write('filename,width,height,class,xmin,ymin,xmax,ymax\n')

  const dir = fs.readdirSync(annotationsDir);

  for (let next of dir) {
    if (next.endsWith('.xml')) {
      let data = fs.readFileSync(annotationsDir+'/'+next);
      let json = JSON.parse(parser.toJson(data, {}));
      let filename = json['annotation']['filename'];
      if (fs.existsSync(imagesDir+'/'+filename)) {
        if (isTest && !filename.startsWith('test_')) {
          let newFilename = 'test_'+filename;
          fs.renameSync(imagesDir+'/'+filename, imagesDir+'/'+newFilename);
          filename = newFilename;
        }
        console.log(filename);
        const width = json['annotation']['size']['width'];
        const height = json['annotation']['size']['height'];
        const objects = json['annotation']['object'];
        if (objects.length) {
          for (let obj of objects) {
            const type = obj['name'];
            const xmin = obj['bndbox']['xmin'];
            const ymin = obj['bndbox']['ymin'];
            const xmax = obj['bndbox']['xmax'];
            const ymax = obj['bndbox']['ymax'];
            csvFile.write(filename+','+width+','+height+','+type+','+xmin+','+ymin+','+xmax+','+ymax+'\n')
          }
        }
        else {
          const type = objects['name'];
          const xmin = objects['bndbox']['xmin'];
          const ymin = objects['bndbox']['ymin'];
          const xmax = objects['bndbox']['xmax'];
          const ymax = objects['bndbox']['ymax'];
          csvFile.write(filename+','+width+','+height+','+type+','+xmin+','+ymin+','+xmax+','+ymax+'\n')
        }
      }
      else {
        console.log('img not exist: '+filename);
      }
    }
  }
  csvFile.close();
}

