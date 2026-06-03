const express = require ('express');
const cors = require('cors');
const helmet = require ('helmet');
const morgan = require ('morgan');
const cookieParser = require('cookie-parser');
const errorMiddleware =require ('./middleware/error.middleware');
const { globalLimiter, authLimiter, writeLimiter } =require ('./middleware/rateLimiter');

//Import all routes
const authRoutes =require  ('./routes/auth.routes');
const userRoutes = require ('./routes/user.routes');
const categoryRoutes = require ('./routes/category.routes')
const expenseRoutes =require ('./routes/expense.routes');

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type'],
    credentials:true,
}));

app.use (cookieParser());

app.use(express.json({ limit: '10kb'}));

app.use(express.urlencoded({ extended:true, limit: '10kb'}));

if(process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
}else {
    app.use(morgan('combined'));
}
;
// ─── Rate Limiting ──────────────────────────────────────────────────
app.use('/api/users', globalLimiter);
app.use('/api/expenses',globalLimiter, writeLimiter);
app.use('/api/categories',globalLimiter, writeLimiter);


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);


//Health check-used by docker/deployment tools to check if the app is alive
app.get('/health', (req,res) => {
    res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime:process.uptime(),
    });
});

//Catches any request that didn't match a route above
app.use((req,res) => {
    res.status(404).json({
        success:false,
        message: `Route ${req.originalUrl} not found`,
    });
});

//catches errors thrown anywhere in the app
app.use(errorMiddleware);

module.exports= app;
