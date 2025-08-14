import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

@Injectable()
export class AppConfigService {
  private readonly keyVaultClient: SecretClient | null = null;
  private readonly logger = new Logger(AppConfigService.name);
  private readonly keyVaultCache = new Map<string, string>();

  constructor(private readonly configService: ConfigService) {
    const keyVaultName = this.configService.get<string>('AZURE_KEY_VAULT_NAME');

    if (keyVaultName) {
      const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

      this.keyVaultClient = new SecretClient(
        keyVaultUrl,
        new DefaultAzureCredential(),
      );

      this.logger.log(`Azure Key Vault initialized at: ${keyVaultUrl}`);
    } else {
      this.logger.warn('Azure Key Vault is not configured.');
    }
  }

  async get(key: string, defaultValue?: string): Promise<string> {
    const envValue = this.configService.get<string>(key);

    if (envValue !== undefined && envValue !== null) {
      return envValue;
    }

    const mappedKey = this.mapKeyForKeyVault(key);

    if (this.keyVaultCache.has(mappedKey)) {
      return this.keyVaultCache.get(mappedKey);
    }

    const keyVaultValue = await this.getFromKeyVault(mappedKey);

    if (keyVaultValue) {
      this.keyVaultCache.set(mappedKey, keyVaultValue);

      return keyVaultValue;
    }

    this.logger.warn(
      `Config value for "${key}" not found in env, ConfigMap, or Key Vault.` +
        (defaultValue !== undefined &&
        defaultValue !== null &&
        defaultValue !== ''
          ? ` Using default value: "${defaultValue}"`
          : ''),
    );

    return defaultValue ?? '';
  }

  private async getFromKeyVault(key: string): Promise<string | null> {
    if (!this.keyVaultClient) {
      this.logger.warn(
        `Key Vault client not initialized. Skipping retrieval for key: "${key}".`,
      );

      return null;
    }

    try {
      const secret = await this.keyVaultClient.getSecret(key);

      return secret.value || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.warn(
        `Failed to retrieve secret for key "${key}" from Key Vault. Error: ${errorMessage}`,
      );

      return null;
    }
  }

  private mapKeyForKeyVault(key: string): string {
    return key.toLowerCase().replace(/_/g, '-');
  }
}
