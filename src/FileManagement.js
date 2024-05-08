import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FileListCombined from './FileListCombined';
import { useParams } from 'react-router-dom';

const FileManagement = () => {
    const { nodeName } = useParams(); // Extract nodeName from the URL

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <Tabs>
        <TabList>
          <Tab>File List</Tab>
        </TabList>
        
        <TabPanel>
          <FileListCombined nodeName={nodeName}/>
        </TabPanel>

      </Tabs>
    </div>
  );
};

export default FileManagement;
