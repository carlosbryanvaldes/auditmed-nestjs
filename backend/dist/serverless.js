"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const server = (0, express_1.default)();
let cachedApp = null;
async function createApp() {
    if (cachedApp)
        return cachedApp;
    const nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server), { logger: ['error', 'warn'] });
    nestApp.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }));
    nestApp.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    nestApp.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    nestApp.setGlobalPrefix('api', { exclude: ['health'] });
    await nestApp.init();
    cachedApp = server;
    return cachedApp;
}
//# sourceMappingURL=serverless.js.map