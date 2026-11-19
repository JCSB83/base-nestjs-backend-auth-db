import { Module } from "@nestjs/common";
import { AuthDbConfig } from "./auth-db.config";

@Module({
    providers: [AuthDbConfig],
    exports: [AuthDbConfig]
})
export class AuthDbConfigModule {}