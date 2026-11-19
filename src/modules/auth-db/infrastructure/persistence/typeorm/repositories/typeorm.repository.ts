import { InjectDataSource } from "@nestjs/typeorm";
import { AUTH_CONNECTION_NAME } from "@/modules/auth-db/auth-db.constants";
import { DataSource } from "typeorm";

export class TypeOrmRepository {
    constructor(@InjectDataSource(AUTH_CONNECTION_NAME)
                protected readonly dataSource: DataSource) {}

    getDataSource(): DataSource {
        return this.dataSource;    
    }
}