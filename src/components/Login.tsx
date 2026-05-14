import { useState } from 'react';
import { useS3 } from '../hooks/useS3';
import { Shield } from 'lucide-react';

export function Login() {
  const { setCredentials } = useS3();
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [bucketName, setBucketName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
      setError('All fields are required to access the vault.');
      return;
    }

    setCredentials({
      accessKeyId,
      secretAccessKey,
      region,
      bucketName,
    });
  };

  return (
    <div className="login-container">
      <div className="login-info">
        <div className="ephemeral-badge">
          <Shield size={16} />
          Strictly Ephemeral
        </div>
        <h2>Secure, volatile access to your AWS S3 buckets.</h2>
        <p>
          Jagah is a pure client-side application. Your credentials and data are kept exclusively in volatile browser memory.
        </p>
        <p>
          We do not store, log, or transmit your keys anywhere else. Refreshing or closing this tab instantly and permanently destroys all access.
        </p>
      </div>

      <div className="login-form-wrapper">
        <form className="glass-panel login-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Connect to Bucket</h3>
            <p style={{ marginTop: '0.5rem' }}>Enter temporary AWS credentials</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="accessKeyId">Access Key ID</label>
            <input
              id="accessKeyId"
              type="text"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="AKIA..."
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="secretAccessKey">Secret Access Key</label>
            <input
              id="secretAccessKey"
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="region">AWS Region</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {[
                'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
                'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-south-2',
                'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
                'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ap-southeast-4',
                'ca-central-1', 'ca-west-1', 'eu-central-1', 'eu-central-2',
                'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-south-1', 'eu-south-2',
                'eu-north-1', 'il-central-1', 'me-south-1', 'me-central-1',
                'sa-east-1', 'us-gov-east-1', 'us-gov-west-1', 'cn-north-1', 'cn-northwest-1'
              ].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bucketName">Bucket Name</label>
            <input
              id="bucketName"
              type="text"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              placeholder="my-secure-bucket"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}
