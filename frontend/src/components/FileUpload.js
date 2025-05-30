import React, { useState } from 'react';
import './Form.css'; // Can reuse some form styling

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
    setUploadResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload files.');
      return;
    }

    const formData = new FormData();
    formData.append('audiofile', file); // 'audiofile' must match the name in backend (upload.single('audiofile'))

    setLoading(true);
    setError('');
    setMessage('');
    setUploadResponse(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data' is automatically set by browser when using FormData
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload file.');
      }

      setMessage(data.message || 'File uploaded successfully!');
      setUploadResponse(data);
      setFile(null); // Clear the file input after successful upload
      // Optionally clear the file input visually, though this is tricky with controlled file inputs
      // e.target.reset(); // If used within the form element directly
      document.getElementById('audiofile-input').value = null;

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '30px' }}>
      <h3>Upload Audio File</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="audiofile-input">Audio File:</label>
          <input 
            type="file" 
            id="audiofile-input"
            accept="audio/*" // Suggest only audio files to the user
            onChange={handleFileChange} 
            disabled={loading} 
          />
        </div>
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p className="form-message error" style={{ marginTop: '10px' }}>{error}</p>}
      {message && <p className="form-message success" style={{ marginTop: '10px' }}>{message}</p>}
      {uploadResponse && (
        <div style={{ marginTop: '15px', textAlign: 'left' }}>
          <h4>Upload Details:</h4>
          <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(uploadResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
