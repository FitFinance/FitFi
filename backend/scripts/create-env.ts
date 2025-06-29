import chalk from 'chalk';
import fs from 'fs';

let path: string | undefined = process.argv[2];
let overwrite: boolean = process.argv[3] == 'true' ? true : false;

if (!path || !fs.existsSync(path)) {
  console.log(
    chalk.bgRed.white('ERROR:'),
    chalk.magenta(
      'Invalid path provided, Please give path where .env and secret.env should be created'
    )
  );
  process.exit(-1);
}

const envVars: Array<string> = ['PORT','REDIS_URI','REDIS_PASS','NODE_ENV','MONGOOSE_URI','JWT_SECRET','JWT_TTL']; // prettier-ignore
const secretVars: Array<string> = ['JWT_TOKEN', 'MONGOOSE_PASSWORD'];

function generateFileContent(variables: Array<string>): string {
  const content: string = variables.reduce(function (
    prev: string,
    cur: string
  ) {
    return prev + cur + '=\n';
  },
  '');
  return content;
}
async function writeFile(
  filePath: string,
  fileContent: string,
  overWrite: boolean = false
) {
  const fileExists: boolean = fs.existsSync(filePath);

  if (!overWrite && fileExists) {
    console.log(
      chalk.bgYellow.black('WARNING:'),
      chalk.yellow(`${filePath} already exists. File was not overwritten.`)
    );
    return;
  } else if (overWrite && fileExists) {
    console.log(
      chalk.bgYellowBright.black('WARNING'),
      chalk.magenta(`${filePath} will be overwritten`)
    );
  }

  fs.writeFile(filePath, fileContent, (err: any) => {
    if (err) {
      console.log(
        chalk.bgRed.white('ERROR:'),
        chalk.red('Unable to create env file')
      );
      process.exit(-1);
    }

    console.log(
      chalk.white.bgGreen('SUCCESS: '),
      chalk.green(`${filePath} File was created successfully`)
    );
    console.log(
      chalk.black.bgYellow('MESSAGE: '),
      chalk.cyan(`Please fill ${filePath} variables in the file`)
    );
  });
}

const envFileContent: string = generateFileContent(envVars);
const secretEnvContent: string = generateFileContent(secretVars);

writeFile(path + '.env', envFileContent, overwrite);
writeFile(path + 'secret.env', secretEnvContent, overwrite);
