import 'reflect-metadata';
import app from './src/app';

const port = 8000;

app.listen(port, () => {
	console.log(`App running at port ${port}`);
});
