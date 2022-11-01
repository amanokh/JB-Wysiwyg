import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import Editor from "./components/Editor";

const App = () => {
    return (
        <div className="App">
            <Editor />
        </div>
    );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
      <App/>
  </React.StrictMode>
);

export {App};
