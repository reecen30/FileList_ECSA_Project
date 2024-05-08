import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiX, FiDownload } from 'react-icons/fi';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const FileListCombined = ({nodeName}) => {
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('Node');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    useEffect(() => {
        console.log(`Fetching files for nodeName: ${nodeName} with refreshTrigger: ${refreshTrigger}`);
        if (!nodeName) {
          console.log('NodeName is required');
          return;
        }
        const fetchFiles = async () => {
          try {
            const response = await axios.get(`https://prod-152.westeurope.logic.azure.com:443/workflows/35a4765e7d904afb862fd62fdb5dda85/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Elg1NW33W7FDDCkbreySjxvWZbQ2dA6yO4n0tPIH-IM&NodeName=${nodeName}`);
            if (response.status === 200 && response.data.items && response.data.items.length > 0) {
              setFiles(response.data.items);
            } else {
              setFiles([]);
              toast.info('No files found.');
            }
          } catch (error) {
            console.error('Failed to fetch files:', error);
            setFiles([]);
          }
        };
      
        fetchFiles();
      }, [nodeName, refreshTrigger]);
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('No file selected. Please select a file to upload.');
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post(`https://prod-72.westeurope.logic.azure.com:443/workflows/4170820a5fda44f2af95f1f941dbf181/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ypUdclSgkySoUylWz1TcqxqVmTOMu8VPLujSa4VqsFQ&NodeName=${nodeName}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setFile(null);  // Clear the file input after successful upload
        setFileInputKey(Date.now()); // Reset file input key to force re-render of the input
        setRefreshTrigger(!refreshTrigger); // Toggle to refresh the file list
        toast.success('File uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Error uploading file: ${error.response ? error.response.data.message : error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  useEffect(() => {
    if (files.length > 0) {
      filterAndSortFiles();
    } else {
      setFilteredFiles([]);
    }
  }, [files, searchTerm, sortKey]);

  const filterAndSortFiles = useCallback(() => {
    let updatedFiles = files.filter(file =>
      file.Node.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.docId.includes(searchTerm)
    );

    updatedFiles.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });

    setFilteredFiles(updatedFiles);
  }, [files, searchTerm, sortKey]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortKey(event.target.value);
  };

  const openModal = (file) => {
    setFileToDelete(file);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleDownload = async (file) => {
    if (!file) {
      toast.error('No file selected for download.');
      return;
    }

    const data = `docId=${file.docId}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await axios.post('https://prod-83.westeurope.logic.azure.com:443/workflows/03ce9cdf19a74c1ba6ef093be128e086/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=82FYf_CKBlSsNxPd16pFxmNEcZOXtWXEjFW2pdA62yg', data, { headers });
      if (response.data.url) {
        const fileUrl = response.data.url;
        const link = document.createElement('a');
        link.href = fileUrl;
        const filename = fileUrl.split('/').pop().split('?')[0];
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success('File downloaded successfully!');
      } else {
        throw new Error('File download URL not found');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) {
      toast.error('No file selected for deletion.');
      return;
    }

    const data = `docId=${fileToDelete.docId}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await axios.post('https://prod-100.westeurope.logic.azure.com:443/workflows/640a7a68545c410eb054bbea457b6eba/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TdyKhtCyq48eEhJ8_4jAqt9X46_7LFxgddZfeDp9VXw', data, { headers });
      if (response.status === 200) {
        setFiles(prevFiles => prevFiles.filter(f => f.docId !== fileToDelete.docId));
        closeModal();
        toast.success('File deleted successfully!');
      } else {
        throw new Error('Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      closeModal(); // Optionally keep the modal open or provide feedback
      toast.error('Error deleting file. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-blue-100 p-5 rounded-lg shadow-lg">
      <ToastContainer
            position="bottom-right"
            autoClose={4000} // Toast will close after 5000 milliseconds (5 seconds)
            hideProgressBar={false} // Shows the progress bar
            newestOnTop={false} // New toasts will appear below the older ones
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover // Pause the auto-close timer on hover
    />
      <div className="mb-4">
        <input
          key={fileInputKey}
          type="file"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
      <div className="bg-white p-5 rounded shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by Node or Document ID"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded w-full focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            onChange={handleSortChange}
            className="p-2 border border-gray-300 rounded w-full sm:w-auto focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Node">Sort by Node</option>
            <option value="docId">Sort by Document ID</option>
            <option value="ModifiedDate">Sort by Modified Date</option>
          </select>
        </div>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">Node</th>
                <th scope="col" className="py-3 px-6">Document ID</th>
                <th scope="col" className="py-3 px-6">Modified Date</th>
                <th scope="col" className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.docId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="py-4 px-6">{file.Node}</td>
                  <td className="py-4 px-6">{file.docId}</td>
                  <td className="py-4 px-6">{file.ModifiedDate}</td>
                  <td className="py-4 px-6 flex gap-2 justify-start">
                    <button className="text-red-500 hover:text-red-700" onClick={() => openModal(file)}>
                      <FiX size={20} />
                    </button>
                    <button className="text-green-500 hover:text-green-700" onClick={() => handleDownload(file)}>
                      <FiDownload size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Confirm Delete"
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid #ccc',
              background: '#fff',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '4px',
              outline: 'none',
              padding: '20px'
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)'
            }
          }}
        >
          <h2 className="text-lg font-semibold">Are you sure you want to delete this file?</h2>
          <div className="flex justify-end space-x-4 mt-4">
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleDelete}>Yes</button>
            <button className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={closeModal}>No</button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FileListCombined;
