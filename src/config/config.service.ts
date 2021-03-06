import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    const config = dotenv.parse(fs.readFileSync(`.env`));
    this.envConfig = this.validateInput(config);
  }

  /*
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test', 'provision'])
        .default('development'),
      DB_PORT: Joi.number().default(5432),
      SECRET_KEY: Joi.string().required(),
      DB_HOSTNAME: Joi.string(),
      DB_PASSWORD: Joi.string().allow(''),
      DB_USERNAME: Joi.string().required(),
      ADMIN_PASSWORD: Joi.string(),
      USER_PASSWORD: Joi.string(),
      FIRST_RUN: Joi.boolean().default(false),
      RELIC_KEY: Joi.string(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(envConfig, envVarsSchema);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get secretKey(): string {
    return String(this.envConfig.SECRET_KEY);
  }

  get databaseHostName(): string {
    return String(this.envConfig.DB_HOSTNAME);
  }

  get databaseUserName(): string {
    return String(this.envConfig.DB_USERNAME);
  }

  get databasePassword(): string {
    return String(this.envConfig.DB_PASSWORD);
  }

  get databasePort(): string {
    return String(this.envConfig.DB_PORT);
  }

  get firstRun(): boolean {
    return Boolean(this.envConfig.FIRST_RUN);
  }

  get defaultPasswords(): DefaultPasswords {
    return {
      admin: String(this.envConfig.ADMIN_PASSWORD),
      user: String(this.envConfig.USER_PASSWORD),
    };
  }
}

interface DefaultPasswords {
  admin: string;
  user: string;
}
