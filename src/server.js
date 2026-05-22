require('dotenv').config( { path: require('path').resolve(__dirname, '../.env') });

const  app =require('./app');
const pool =require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try{
    await pool.query('SELECT NOW()');
    console.log('Database connection verified');
    //start the HTTP server
    const server=app.listen(PORT, () =>{
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
  }catch (error) {
    console.error('Failed to start server:' , error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections — catches async errors that weren't caught
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions — catches synchronous errors that weren't caught
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

startServer();