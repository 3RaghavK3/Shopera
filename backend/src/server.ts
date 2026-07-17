import express, { Application, Request, Response } from 'express';
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) ||  3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});