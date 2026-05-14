import { useState, useEffect, useRef } from 'react';
import { useS3 } from '../hooks/useS3';
import { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { Folder, File as FileIcon, ChevronRight, Upload, Trash2, Edit2, Database } from 'lucide-react';

interface FileItem {
  key: string;
  name: string;
  isFolder: boolean;
  size?: number;
}

export function Explorer() {
  const { s3Client, credentials } = useS3();
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems(currentPrefix);
  }, [currentPrefix, s3Client, credentials]);

  const fetchItems = async (prefix: string) => {
    if (!s3Client || !credentials) return;
    setLoading(true);
    setError('');

    try {
      const command = new ListObjectsV2Command({
        Bucket: credentials.bucketName,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await s3Client.send(command);

      const folders = (response.CommonPrefixes || []).map((prefixObj) => {
        const name = prefixObj.Prefix?.substring(prefix.length).replace('/', '') || '';
        return {
          key: prefixObj.Prefix || '',
          name,
          isFolder: true,
        };
      });

      const files = (response.Contents || [])
        .filter((file) => file.Key !== prefix) // Exclude the current folder itself
        .map((file) => {
          const name = file.Key?.substring(prefix.length) || '';
          return {
            key: file.Key || '',
            name,
            isFolder: false,
            size: file.Size,
          };
        });

      setItems([...folders, ...files]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to list objects.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (newPrefix: string) => {
    setCurrentPrefix(newPrefix);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !s3Client || !credentials) return;

    setLoading(true);
    try {
      const command = new PutObjectCommand({
        Bucket: credentials.bucketName,
        Key: currentPrefix + file.name,
        Body: file,
      });
      await s3Client.send(command);
      fetchItems(currentPrefix);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload file.');
      setLoading(false);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    if (!s3Client || !credentials) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete this file?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const command = new DeleteObjectCommand({
        Bucket: credentials.bucketName,
        Key: key,
      });
      await s3Client.send(command);
      fetchItems(currentPrefix);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete file.');
      setLoading(false);
    }
  };

  const handleRename = async (e: React.MouseEvent, oldKey: string, oldName: string) => {
    e.stopPropagation();
    if (!s3Client || !credentials) return;

    const newName = window.prompt('Enter new name for the file:', oldName);
    if (!newName || newName === oldName) return;

    const newKey = currentPrefix + newName;

    setLoading(true);
    try {
      const copyCommand = new CopyObjectCommand({
        Bucket: credentials.bucketName,
        CopySource: `${credentials.bucketName}/${oldKey}`,
        Key: newKey,
      });
      await s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: credentials.bucketName,
        Key: oldKey,
      });
      await s3Client.send(deleteCommand);

      fetchItems(currentPrefix);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to rename file.');
      setLoading(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const breadcrumbs = currentPrefix.split('/').filter(Boolean);

  return (
    <div className="explorer-container">
      <div className="explorer-header glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px' }}>
        <div className="breadcrumbs">
          <span className="breadcrumb-item" onClick={() => handleNavigate('')}>Root</span>
          {breadcrumbs.map((crumb, index) => {
            const prefix = breadcrumbs.slice(0, index + 1).join('/') + '/';
            return (
              <span key={prefix} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronRight size={16} className="breadcrumb-separator" />
                <span className="breadcrumb-item" onClick={() => handleNavigate(prefix)}>{crumb}</span>
              </span>
            );
          })}
        </div>
        <button className="btn-primary" onClick={handleUploadClick} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Upload size={16} />
          Upload
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>

      {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading-container">
          <Database size={36} className="moving-db" />
          <p className="loading-text">Loading...</p>
        </div>
      ) : (
        <div className="file-grid">
          {items.length === 0 && !error && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              No items found in this location.
            </div>
          )}
          
          {items.map((item, index) => (
            <div 
              key={item.key} 
              className="glass-panel file-item"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => item.isFolder ? handleNavigate(item.key) : null}
            >
              {item.isFolder ? (
                <Folder size={40} className="file-item-icon" />
              ) : (
                <FileIcon size={40} className="file-item-icon" />
              )}
              <span className="file-item-name" title={item.name}>{item.name}</span>
              {!item.isFolder && <span className="file-item-size">{formatSize(item.size)}</span>}
              {!item.isFolder && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }} className="file-actions">
                  <div className="action-icon" onClick={(e) => handleRename(e, item.key, item.name)} title="Rename">
                    <Edit2 size={16} />
                  </div>
                  <div className="action-icon action-delete" onClick={(e) => handleDelete(e, item.key)} title="Delete">
                    <Trash2 size={16} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
