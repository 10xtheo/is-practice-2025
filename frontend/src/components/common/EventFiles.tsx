import React, { useEffect, useState } from 'react';
import { useTypedSelector } from 'hooks/index';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';
import { getEventFiles } from 'store/events/actions';
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
  const { users } = useTypedSelector(({ users }) => users);

  useEffect(() => {
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

    fetchFiles();
  }, [eventId, dispatch]);

  if (loading) {
    return <div className={styles.loading}>Загрузка файлов...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (files.length === 0) {
    return <div className={styles.empty}>Нет прикрепленных файлов</div>;
  }

  return (
    <div className={styles.files}>
      {files.map((file) => (
        <a
          key={file.id}
          href={file.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.file}
        >
          <i className={getFileIcon(file.filename)}></i>
          <div className={styles.file__info}>
            <div className={styles.file__name}>{file.filename}</div>
            <div className={styles.file__user}>
              Добавил: {users.find(u => u.id === file.user_id)?.full_name || 'Неизвестный пользователь'}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default EventFiles; 