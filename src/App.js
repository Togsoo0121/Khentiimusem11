import "./App.css";
import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, set, onValue } from "firebase/database";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const CLOUD_NAME = "dsg5ey8do";
const UPLOAD_PRESET = "museum_upload";

const defaultData = {
  museumName: "Хэнтий музей",
  slogan: "Virtual Museum Platform",
  loader: {
    enabled: true,
    text: "Хэнтий музей",
    subText: "Түүх • Соёл • Өв",
    image: "/loading.jpg",
  },
  heroTitle: "Түүхийг мэдэрч, өвийг цахимаар үзнэ",
  heroText: "Музейн танхим, үзмэр, мэдээ, зураг, бичлэгийн цахим систем.",
  heroImage:
    "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=1800&q=80",
  about:
    "Хэнтий аймгийн музей нь түүх, археологи, угсаатны зүй, соёлын өвийг хадгалж хамгаалан олон нийтэд сурталчлах байгууллага юм.",
  halls: [
    {
      title: "Түүхийн танхим",
      desc: "Хэнтий нутгийн түүхэн хөгжил, баримт, дурсгал.",
      image:
        "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=900&q=80",
    },
  ],
  exhibits: [],
  news: [],
  videos: [],
  contact: {
    address: "Чингис хот, Хэнтий аймаг",
    email: "museum@khentii.mn",
    phone: "0000-0000",
  },
};

function safeData(saved) {
  return {
    ...defaultData,
    ...(saved || {}),
    loader: { ...defaultData.loader, ...(saved?.loader || {}) },
    contact: { ...defaultData.contact, ...(saved?.contact || {}) },
    halls: Array.isArray(saved?.halls) ? saved.halls : defaultData.halls,
    exhibits: Array.isArray(saved?.exhibits) ? saved.exhibits : [],
    news: Array.isArray(saved?.news) ? saved.news : [],
    videos: Array.isArray(saved?.videos) ? saved.videos : [],
  };
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdminPage] = useState(window.location.pathname === "/admin");
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    const dataRef = ref(db, "museumData");

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(safeData(snapshot.val()));
        } else {
          set(dataRef, defaultData);
        }
        setTimeout(() => setLoading(false), 900);
      },
      () => {
        setData(defaultData);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const saveData = async (newData) => {
    const fixed = safeData(newData);
    setData(fixed);
    await set(ref(db, "museumData"), fixed);
  };

  const loginAdmin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
    } catch {
      alert("Email эсвэл нууц үг буруу байна");
    }
  };

  const logoutAdmin = async () => {
    await signOut(auth);
    setLoggedIn(false);
  };

  const uploadToCloudinary = async (file, type = "image") => {
    if (!file) {
      alert("Файл сонгоогүй байна");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`,
        { method: "POST", body: formData }
      );

      const result = await res.json();

      if (!res.ok || !result.secure_url) {
        alert(result.error?.message || "Upload амжилтгүй");
        return null;
      }

      return result.secure_url;
    } catch (error) {
      console.error(error);
      alert("Upload холболтын алдаа");
      return null;
    }
  };

  const updateField = (field, value) => {
    saveData({ ...data, [field]: value });
  };

  const updateNested = (parent, field, value) => {
    saveData({ ...data, [parent]: { ...data[parent], [field]: value } });
  };

  const addItem = (key, item) => {
    saveData({ ...data, [key]: [...(data[key] || []), item] });
  };

  const updateItem = (key, index, field, value) => {
    const updated = (data[key] || []).map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    saveData({ ...data, [key]: updated });
  };

  const deleteItem = (key, index) => {
    saveData({
      ...data,
      [key]: (data[key] || []).filter((_, i) => i !== index),
    });
  };

  const uploadImage = async (key, index, file) => {
    const url = await uploadToCloudinary(file, "image");
    if (url) updateItem(key, index, "image", url);
  };

  const uploadVideo = async (index, file) => {
    const url = await uploadToCloudinary(file, "video");
    if (url) updateItem("videos", index, "url", url);
  };

  const uploadHero = async (file) => {
    const url = await uploadToCloudinary(file, "image");
    if (url) updateField("heroImage", url);
  };

  const uploadLoader = async (file) => {
    const url = await uploadToCloudinary(file, "image");
    if (url) updateNested("loader", "image", url);
  };

  if (loading && data.loader.enabled && !isAdminPage) {
    return (
      <div className="loaderScreen">
        {data.loader.image && (
          <img className="loaderSeal" src={data.loader.image} alt="loading" />
        )}
        <h1>{data.loader.text}</h1>
        <p>{data.loader.subText}</p>
      </div>
    );
  }

  if (isAdminPage) {
    return (
      <div className="adminPage">
        {!loggedIn ? (
          <div className="adminLogin">
            <h1>Super Admin</h1>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={loginAdmin}>Нэвтрэх</button>
          </div>
        ) : (
          <div className="adminPanel">
            <div className="adminTop">
              <h1>Музейн удирдлага</h1>
              <div>
                <button onClick={() => (window.location.href = "/")}>
                  Нүүр
                </button>
                <button onClick={logoutAdmin}>Гарах</button>
              </div>
            </div>

            <AdminBlock title="Loading screen">
              <label>
                <input
                  type="checkbox"
                  checked={data.loader.enabled}
                  onChange={(e) =>
                    updateNested("loader", "enabled", e.target.checked)
                  }
                />{" "}
                Асаах
              </label>

              <input
                value={data.loader.text}
                onChange={(e) => updateNested("loader", "text", e.target.value)}
                placeholder="Loading text"
              />

              <input
                value={data.loader.subText}
                onChange={(e) =>
                  updateNested("loader", "subText", e.target.value)
                }
                placeholder="Loading sub text"
              />

              <input
                value={data.loader.image}
                onChange={(e) =>
                  updateNested("loader", "image", e.target.value)
                }
                placeholder="Loading зураг URL"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadLoader(e.target.files[0])}
              />
            </AdminBlock>

            <AdminBlock title="Нүүр хуудас">
              <input
                value={data.museumName}
                onChange={(e) => updateField("museumName", e.target.value)}
                placeholder="Музейн нэр"
              />

              <input
                value={data.slogan}
                onChange={(e) => updateField("slogan", e.target.value)}
                placeholder="Уриа"
              />

              <input
                value={data.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                placeholder="Гарчиг"
              />

              <textarea
                value={data.heroText}
                onChange={(e) => updateField("heroText", e.target.value)}
                placeholder="Тайлбар"
              />

              <input
                value={data.heroImage}
                onChange={(e) => updateField("heroImage", e.target.value)}
                placeholder="Нүүр зураг URL"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadHero(e.target.files[0])}
              />
            </AdminBlock>

            <AdminBlock title="Музейн тухай">
              <textarea
                value={data.about}
                onChange={(e) => updateField("about", e.target.value)}
              />
            </AdminBlock>

            <AdminBlock title="Танхимууд">
              <button
                onClick={() =>
                  addItem("halls", {
                    title: "Шинэ танхим",
                    desc: "Тайлбар",
                    image: "",
                  })
                }
              >
                + Танхим нэмэх
              </button>

              <EditableList
                items={data.halls}
                dataKey="halls"
                updateItem={updateItem}
                deleteItem={deleteItem}
                uploadImage={uploadImage}
                image
              />
            </AdminBlock>

            <AdminBlock title="Үзмэрүүд">
              <button
                onClick={() =>
                  addItem("exhibits", {
                    title: "Шинэ үзмэр",
                    desc: "Тайлбар",
                    image: "",
                  })
                }
              >
                + Үзмэр нэмэх
              </button>

              <EditableList
                items={data.exhibits}
                dataKey="exhibits"
                updateItem={updateItem}
                deleteItem={deleteItem}
                uploadImage={uploadImage}
                image
              />
            </AdminBlock>

            <AdminBlock title="Мэдээ">
              <button
                onClick={() =>
                  addItem("news", {
                    date: "2026.04.25",
                    title: "Шинэ мэдээ",
                    desc: "Тайлбар",
                  })
                }
              >
                + Мэдээ нэмэх
              </button>

              <EditableList
                items={data.news}
                dataKey="news"
                updateItem={updateItem}
                deleteItem={deleteItem}
                date
              />
            </AdminBlock>

            <AdminBlock title="Видео">
              <button
                onClick={() =>
                  addItem("videos", {
                    title: "Шинэ видео",
                    desc: "Тайлбар",
                    url: "",
                  })
                }
              >
                + Видео нэмэх
              </button>

              {(data.videos || []).map((v, i) => (
                <div className="editItem" key={i}>
                  <input
                    value={v.title || ""}
                    onChange={(e) =>
                      updateItem("videos", i, "title", e.target.value)
                    }
                    placeholder="Видео гарчиг"
                  />

                  <textarea
                    value={v.desc || ""}
                    onChange={(e) =>
                      updateItem("videos", i, "desc", e.target.value)
                    }
                    placeholder="Видео тайлбар"
                  />

                  <input
                    value={v.url || ""}
                    onChange={(e) =>
                      updateItem("videos", i, "url", e.target.value)
                    }
                    placeholder="Видео URL"
                  />

                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => uploadVideo(i, e.target.files[0])}
                  />

                  <button onClick={() => deleteItem("videos", i)}>
                    Устгах
                  </button>
                </div>
              ))}
            </AdminBlock>

            <AdminBlock title="Холбоо барих">
              <input
                value={data.contact.address}
                onChange={(e) =>
                  updateNested("contact", "address", e.target.value)
                }
                placeholder="Хаяг"
              />

              <input
                value={data.contact.email}
                onChange={(e) =>
                  updateNested("contact", "email", e.target.value)
                }
                placeholder="Email"
              />

              <input
                value={data.contact.phone}
                onChange={(e) =>
                  updateNested("contact", "phone", e.target.value)
                }
                placeholder="Утас"
              />
            </AdminBlock>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="siteHeader">
        <div className="brand">
          <div className="brandMark">ХМ</div>
          <div>
            <h1>{data.museumName}</h1>
            <p>{data.slogan}</p>
          </div>
        </div>

        <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#about">Танилцуулга</a>
          <a href="#halls">Танхим</a>
          <a href="#exhibits">Үзмэр</a>
          <a href="#videos">Видео</a>
          <a href="#news">Мэдээ</a>
          <a href="#contact">Холбоо</a>
        </nav>
      </header>

      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.75), rgba(0,0,0,.25)), url("${data.heroImage}")`,
        }}
      >
        <div className="heroContent">
          <span className="eyebrow">
            Хэнтий аймгийн соёлын өвийн цахим орон зай
          </span>
          <h2>{data.heroTitle}</h2>
          <p>{data.heroText}</p>
        </div>
      </section>

      <section className="aboutSection" id="about">
        <div>
          <span className="eyebrow darkText">About Museum</span>
          <h3>Музейн тухай</h3>
          <p>{data.about}</p>
        </div>

        <div className="statsGrid">
          <div>
            <b>{data.halls.length}+</b>
            <span>Танхим</span>
          </div>
          <div>
            <b>{data.exhibits.length}+</b>
            <span>Үзмэр</span>
          </div>
          <div>
            <b>{data.news.length}+</b>
            <span>Мэдээ</span>
          </div>
        </div>
      </section>

      <CardSection id="halls" title="Танхимууд" items={data.halls} />

      <CardSection
        id="exhibits"
        title="Онцлох үзмэрүүд"
        items={data.exhibits}
      />

      <section className="videosSection" id="videos">
        <span className="eyebrow darkText">Videos</span>
        <h3>Видео бичлэг</h3>

        {data.videos.length === 0 ? (
          <div className="emptyState">Видео нэмэгдээгүй байна.</div>
        ) : (
          <div className="videoGrid">
            {data.videos.map((v, i) => (
              <article className="videoCard" key={i}>
                {v.url && <video src={v.url} controls />}
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="newsSection" id="news">
        <span className="eyebrow darkText">Latest News</span>
        <h3>Мэдээ мэдээлэл</h3>

        {data.news.length === 0 ? (
          <div className="emptyState">Мэдээ нэмэгдээгүй байна.</div>
        ) : (
          <div className="newsGrid">
            {data.news.map((n, i) => (
              <article className="newsCard" key={i}>
                <b>{n.date}</b>
                <h4>{n.title}</h4>
                <p>{n.desc}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer" id="contact">
        <h3>{data.museumName}</h3>
        <p>{data.contact.address}</p>
        <p>{data.contact.email}</p>
        <p>{data.contact.phone}</p>
        <p>© 2026 {data.museumName}</p>
      </footer>
    </div>
  );
}

function AdminBlock({ title, children }) {
  return (
    <section className="adminBlock">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function EditableList({
  items,
  dataKey,
  updateItem,
  deleteItem,
  uploadImage,
  image,
  date,
}) {
  return (
    <>
      {items.map((item, index) => (
        <div className="editItem" key={index}>
          {date && (
            <input
              value={item.date || ""}
              onChange={(e) =>
                updateItem(dataKey, index, "date", e.target.value)
              }
              placeholder="Огноо"
            />
          )}

          <input
            value={item.title || ""}
            onChange={(e) =>
              updateItem(dataKey, index, "title", e.target.value)
            }
            placeholder="Гарчиг"
          />

          <textarea
            value={item.desc || ""}
            onChange={(e) => updateItem(dataKey, index, "desc", e.target.value)}
            placeholder="Тайлбар"
          />

          {image && (
            <>
              <input
                value={item.image || ""}
                onChange={(e) =>
                  updateItem(dataKey, index, "image", e.target.value)
                }
                placeholder="Зургийн URL"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(dataKey, index, e.target.files[0])}
              />
            </>
          )}

          <button onClick={() => deleteItem(dataKey, index)}>Устгах</button>
        </div>
      ))}
    </>
  );
}

function CardSection({ id, title, items }) {
  return (
    <section className="hallsSection" id={id}>
      <span className="eyebrow darkText">{title}</span>
      <h3>{title}</h3>

      {items.length === 0 ? (
        <div className="emptyState">{title} нэмэгдээгүй байна.</div>
      ) : (
        <div className="cardGrid">
          {items.map((item, index) => (
            <article className="hallCard" key={index}>
              {item.image && <img src={item.image} alt={item.title} />}
              <div>
                <span>0{index + 1}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
