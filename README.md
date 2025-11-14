<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS project for accessing CloudFlare R2 object storage service. This project provides a RESTful API to interact with CloudFlare R2 buckets, including file upload, download, deletion, listing, and presigned URL generation.

## Project Setup

### Installation

This project uses `pnpm` as the package manager:

```bash
$ pnpm install
```

### Environment Variables

Copy `.env.example` and create a `.env` file with your CloudFlare R2 configuration:

```bash
$ cp .env.example .env
```

Edit the `.env` file and fill in the following information:
- `R2_ENDPOINT`: CloudFlare R2 endpoint URL
- `R2_ACCESS_KEY_ID`: R2 access key ID
- `R2_SECRET_ACCESS_KEY`: R2 secret access key
- `R2_BUCKET_NAME`: R2 bucket name
- `PORT`: Application port (default: 3000)

## Running the Project

```bash
# development mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod

# standard mode
$ pnpm run start
```

## API Endpoints

### Upload File
```
POST /r2/upload
Content-Type: multipart/form-data
Body: file (file), key (optional, file path/name)
```

**Example:**
```bash
curl -X POST http://localhost:3000/r2/upload \
  -F "file=@example.txt" \
  -F "key=test/example.txt"
```

### Download File
```
GET /r2/download/*path
```

**Example:**
```bash
curl http://localhost:3000/r2/download/test/example.txt -o downloaded.txt
```

### Get File (Direct Display)
```
GET /r2/file/*path
```

**Example:**
```bash
curl http://localhost:3000/r2/file/test/example.txt
```

### Delete File
```
DELETE /r2/file/*path
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/r2/file/test/example.txt
```

### List Files
```
GET /r2/list?prefix=<prefix>&maxKeys=<maxKeys>
```

**Example:**
```bash
curl http://localhost:3000/r2/list?prefix=test/&maxKeys=10
```

### Check File Exists
```
GET /r2/exists/*path
```

**Example:**
```bash
curl http://localhost:3000/r2/exists/test/example.txt
```

### Get Presigned URL
```
GET /r2/presigned-url/*path?expiresIn=<seconds>
```

**Example:**
```bash
curl http://localhost:3000/r2/presigned-url/test/example.txt?expiresIn=3600
```

## Testing

### Unit Tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

### Manual Testing Workflow

#### Prerequisites

1. Ensure the development server is running:
   ```bash
   $ pnpm run start:dev
   ```

2. Verify the server is accessible:
   ```bash
   $ curl http://localhost:3000
   ```

3. Ensure your `.env` file is configured with valid CloudFlare R2 credentials.

#### Testing File Upload

1. **Create a test file** (optional):
   ```bash
   $ echo "This is a test file for CloudFlare R2 upload" > test-file.txt
   ```

2. **Upload a file**:
   ```bash
   # Using curl
   $ curl -X POST http://localhost:3000/r2/upload \
     -F "file=@test-file.txt" \
     -F "key=test/test-file.txt"
   
   # Or use the test script (PowerShell)
   $ .\test-upload.ps1
   
   # Or use the test script (Bash)
   $ chmod +x test-upload.sh
   $ ./test-upload.sh
   ```

3. **Expected response**:
   ```json
   {
     "message": "檔案上傳成功",
     "success": true,
     "key": "test/test-file.txt"
   }
   ```
   
   Note: The message may be in Chinese based on the controller implementation. A successful upload will return `success: true` with the file key.

#### Testing Other Endpoints

1. **List files**:
   ```bash
   $ curl http://localhost:3000/r2/list?prefix=test/
   ```

2. **Check if file exists**:
   ```bash
   $ curl http://localhost:3000/r2/exists/test/test-file.txt
   ```

3. **Get file**:
   ```bash
   $ curl http://localhost:3000/r2/file/test/test-file.txt
   ```

4. **Get presigned URL**:
   ```bash
   $ curl http://localhost:3000/r2/presigned-url/test/test-file.txt?expiresIn=3600
   ```

5. **Download file**:
   ```bash
   $ curl http://localhost:3000/r2/download/test/test-file.txt -o downloaded.txt
   ```

6. **Delete file**:
   ```bash
   $ curl -X DELETE http://localhost:3000/r2/file/test/test-file.txt
   ```

#### Troubleshooting

- **Connection refused**: Ensure the server is running on port 3000
- **Authentication errors**: Verify your R2 credentials in `.env` file
- **File not found**: Check if the file key/path is correct
- **Upload fails**: Verify R2 bucket name and permissions are correct

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
