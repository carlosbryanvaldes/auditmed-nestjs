"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    app.enableCors({
        origin: corsOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api', { exclude: ['health'] });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 AuditMed API corriendo en puerto ${port}`);
    console.log(`   Env: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map