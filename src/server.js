const express = require('express');
const connectDB = require('./config/db');
const chalk = require('chalk');

const errorHandler = require('./middleware/httpErrorHandler');

const app = express();
connectDB();

app.use(express.json({extended: false}));

app.use('/api/auth', require('./routes/apic/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(chalk.greenBright(`Server started on port ${PORT}`)));
