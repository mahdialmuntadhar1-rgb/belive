/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import ReviewTable from "./pages/ReviewTable";
import DataCleaner from "./pages/DataCleaner";
import TaskManager from "./pages/TaskManager";
import Export from "./pages/Export";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/review" element={<ReviewTable />} />
          <Route path="/cleaner" element={<DataCleaner />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </Layout>
    </Router>
  );
}
