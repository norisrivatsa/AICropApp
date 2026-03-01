import {
  CognitoIdentityClient,
  GetCredentialsForIdentityCommand,
  GetIdCommand
} from "@aws-sdk/client-cognito-identity";
import type { AwsCredentialIdentity, AwsCredentialIdentityProvider } from "@aws-sdk/types";

interface CachedCreds {
  identityId: string;
  creds: AwsCredentialIdentity;
  expirationMs: number;
}

let cache: CachedCreds | null = null;

export function getBrowserCredentials(region: string, identityPoolId: string): AwsCredentialIdentityProvider {
  const client = new CognitoIdentityClient({ region });

  return async () => {
    const now = Date.now();
    if (cache && now < cache.expirationMs - 60_000) {
      return cache.creds;
    }

    const idResp = await client.send(new GetIdCommand({ IdentityPoolId: identityPoolId }));
    if (!idResp.IdentityId) {
      throw new Error("Unable to fetch Cognito identity ID");
    }

    const credsResp = await client.send(
      new GetCredentialsForIdentityCommand({
        IdentityId: idResp.IdentityId
      })
    );

    const c = credsResp.Credentials;
    if (!c?.AccessKeyId || !c?.SecretKey || !c?.SessionToken) {
      throw new Error("Unable to fetch Cognito temporary credentials");
    }

    const creds: AwsCredentialIdentity = {
      accessKeyId: c.AccessKeyId,
      secretAccessKey: c.SecretKey,
      sessionToken: c.SessionToken,
      expiration: c.Expiration
    };

    cache = {
      identityId: idResp.IdentityId,
      creds,
      expirationMs: c.Expiration ? c.Expiration.getTime() : now + 45 * 60_000
    };

    return creds;
  };
}
