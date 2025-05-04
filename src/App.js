import React, { useState } from "react";
import "./App.css";

// Header компонент
function Header() {
  return (
    <header className="header">
      <h1>Хэнтий аймгийн музей</h1>
    </header>
  );
}

// Tabs компонент
function Tabs({ activeTab, setActiveTab }) {
  return (
    <nav className="tabs">
      <button
        className={activeTab === "introduction" ? "active" : ""}
        onClick={() => setActiveTab("introduction")}
      >
        Музейн танилцуулга
      </button>
      <button
        className={activeTab === "heritage" ? "active" : ""}
        onClick={() => setActiveTab("heritage")}
      >
        Соёлын өв
      </button>
      <button
        className={activeTab === "reports" ? "active" : ""}
        onClick={() => setActiveTab("reports")}
      >
        Ажлын тайлан
      </button>
      <button
        className={activeTab === "admin" ? "active" : ""}
        onClick={() => setActiveTab("admin")}
      >
        Удирдлага
      </button>
    </nav>
  );
}

// Introduction компонент
function Introduction() {
  return (
    <div className="introduction">
      <img
        src="https://ncch.gov.mn/Images/Museum/23/photo.jpg"
        alt="Музейн зураг"
        className="museum-image"
      />
      <p>
        Хэнтий аймгийн музей нь БНМАУ-ын Гэгээрлийн сайдын 1949 оны 04 дүгээр
        сарын 08-ны өдрийн 61 тоот тушаалаар “Орон нутгийг судлах кабинет”...
      </p>
    </div>
  );
}

// Heritage компонент
function Heritage() {
  return (
    <div className="heritage">
      <h2>Соёлын өв</h2>
      <p>Энд соёлын өвийн зураг, тайлбар бүхий мэдээлэл байрлана.</p>
      <img src="https://example.com/heritage1.jpg" alt="Соёлын өв 1" />
    </div>
  );
}

// Reports компонент
function Reports() {
  return (
    <div className="reports">
      <h2>Ажлын тайлан</h2>
      <p>Энд музейн үйл ажиллагааны тайлан, зураг, видео мэдээлэл байрлана.</p>
      <ul>
        <li>2024 оны 1-р улирлын тайлан</li>
        <li>2024 оны 2-р улирлын тайлан</li>
      </ul>
    </div>
  );
}

// AdminPanel компонент
function AdminPanel() {
  const [title, setTitle] = useState("Музейн танилцуулга");
  const [content, setContent] = useState("Энд танилцуулгын агуулга байрлана.");

  const handleSave = () => {
    alert("Өөрчлөлт хадгалагдлаа!");
  };

  return (
    <div className="admin-panel">
      <h2>Удирдлага</h2>
      <label>
        Гарчиг:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        Агуулга:
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Хадгалах</button>
    </div>
  );
}

// App үндсэн компонент
function App() {
  const [activeTab, setActiveTab] = useState("introduction");

  const renderTab = () => {
    switch (activeTab) {
      case "introduction":
        return <Introduction />;
      case "heritage":
        return <Heritage />;
      case "reports":
        return <Reports />;
      case "admin":
        return <AdminPanel />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="App">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="tab-content">{renderTab()}</div>
    </div>
  );
}

export default App;
