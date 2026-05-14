import { createContext, useContext, useState, type ReactNode } from 'react';
import { S3Client } from '@aws-sdk/client-s3';

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

interface S3ContextType {
  credentials: AWSCredentials | null;
  s3Client: S3Client | null;
  setCredentials: (creds: AWSCredentials | null) => void;
  disconnect: () => void;
}

const S3Context = createContext<S3ContextType | undefined>(undefined);

export function S3Provider({ children }: { children: ReactNode }) {
  const [credentials, setCredentialsState] = useState<AWSCredentials | null>(null);
  const [s3Client, setS3Client] = useState<S3Client | null>(null);

  const setCredentials = (creds: AWSCredentials | null) => {
    setCredentialsState(creds);
    if (creds) {
      const client = new S3Client({
        region: creds.region,
        credentials: {
          accessKeyId: creds.accessKeyId,
          secretAccessKey: creds.secretAccessKey,
        },
      });
      setS3Client(client);
    } else {
      setS3Client(null);
    }
  };

  const disconnect = () => {
    setCredentials(null);
  };

  return (
    <S3Context.Provider value={{ credentials, s3Client, setCredentials, disconnect }}>
      {children}
    </S3Context.Provider>
  );
}

export function useS3() {
  const context = useContext(S3Context);
  if (context === undefined) {
    throw new Error('useS3 must be used within an S3Provider');
  }
  return context;
}
