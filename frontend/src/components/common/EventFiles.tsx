import React, { useEffect, useState, useRef } from 'react';
import { useTypedSelector } from 'hooks/index';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';
import { getEventFiles, uploadEventFile, deleteEventFile } from 'store/events/actions';
import styles from './EventFiles.module.scss';

interface IEventFile {
  id: string;
  event_id: string;
  user_id: string;
  filename: string;
  file_url: string;
}

interface IEventFilesProps {
  eventId: string;
}

const getFileIcon = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'fas fa-file-pdf';
    case 'doc':
    case 'docx':
      return 'fas fa-file-word';
    case 'xls':
    case 'xlsx':
      return 'fas fa-file-excel';
    case 'ppt':
    case 'pptx':
      return 'fas fa-file-powerpoint';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'fas fa-file-image';
    case 'zip':
    case 'rar':
    case '7z':
      return 'fas fa-file-archive';
    case 'txt':
      return 'fas fa-file-alt';
    default:
      return 'fas fa-file';
  }
};

const EventFiles: React.FC<IEventFilesProps> = ({ eventId }) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const [files, setFiles] = useState<IEventFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { users } = useTypedSelector(({ users }) => users);

  useEffect(() => {
    fetchFiles();
  }, [eventId, dispatch]);

  const fetchFiles = async () => {
    try {
      const response = await dispatch(getEventFiles(eventId)).unwrap();
      setFiles(response);
      setLoading(false);
    } catch (err) {
      if (err.code !== 'ERR_BAD_REQUEST') {
        setError('Не удалось загрузить файлы');
      }
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await dispatch(uploadEventFile({ eventId, file, token })).unwrap();
      await fetchFiles();
    } catch (err) {
      setError('Не удалось загрузить файл');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await dispatch(deleteEventFile({fileId, token})).unwrap();
      await fetchFiles();
    } catch (err) {
      setError('Не удалось удалить файл');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка файлов...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.files}>
      <div className={styles.upload}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button 
          className={styles.upload__button}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Загрузка...' : 'Добавить файл'}
        </button>
      </div>
      
      {files.length === 0 ? (
        <div className={styles.empty}>Нет прикрепленных файлов</div>
      ) : (
        files.map((file) => (
          <div key={file.id} className={styles.file}>
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.file__link}
            >
              <i className={getFileIcon(file.filename)}></i>
              <div className={styles.file__info}>
                <div className={styles.file__name}>{file.filename}</div>
                <div className={styles.file__user}>
                  Добавил: {users.find(u => u.id === file.user_id)?.full_name || 'Неизвестный пользователь'}
                </div>
              </div>
            </a>
            <button
              className={styles.file__delete}
              onClick={() => handleFileDelete(file.id)}
              title="Удалить файл"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default EventFiles; 