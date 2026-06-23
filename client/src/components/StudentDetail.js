import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaSave, FaTimes, FaExchangeAlt, FaFilePdf, FaPrint, FaStickyNote, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf'; 

const StudentDetail = () => {
  const { id } = useParams();
  
  // Veri State'leri
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  
  // İşlem State'leri
  const [payAmount, setPayAmount] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [newTotalFee, setNewTotalFee] = useState(""); // YENİ: Transfer sırasında ücret değişimi için
  
  // Düzenleme Modu
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Makbuz & Not State'leri
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptNote, setReceiptNote] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [resetPayments, setResetPayments] = useState(false); // Ödeme sıfırlama seçeneği

  // Not State'i
  const [newNote, setNewNote] = useState("");

  const fetchData = async () => {
    try {
      // Windows 127.0.0.1 Ayarı
      const response = await axios.get(`/api/students/${id}`);
      const classRes = await axios.get('/api/classes');
      
      setData(response.data);
      setClasses(classRes.data);
      
      if(response.data.student) {
        setEditForm({
            firstName: response.data.student.firstName,
            lastName: response.data.student.lastName,
            tcIdentity: response.data.student.tcIdentity,
            phone: response.data.student.phone
        });
      }
    } catch (error) { console.error("Hata:", error); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const loadFont = async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return window.btoa(binary);
  };

  // --- NOT İŞLEMLERİ ---
  const handleAddNote = async () => {
    if(!newNote.trim()) return toast.warn("Boş not eklenemez!");
    try {
        await axios.post(`/api/students/${id}/note`, { text: newNote });
        toast.success("📌 Not eklendi!");
        setNewNote("");
        fetchData();
    } catch (error) { toast.error("Not eklenirken hata oluştu."); }
  };

  const handleDeleteNote = async (noteId) => {
    if(!window.confirm("Bu notu silmek istediğine emin misin?")) return;
    try {
        await axios.delete(`/api/students/${id}/note/${noteId}`);
        toast.info("Not silindi.");
        fetchData();
    } catch (error) { toast.error("Silinemedi."); }
  };

  // --- MAKBUZ İŞLEMLERİ ---
  const handleOpenReceiptModal = (paymentItem) => {
    setSelectedPayment(paymentItem);
    setReceiptNote(paymentItem.note || "");
    setShowReceiptModal(true);
  };

  const generateReceipt = async () => {
    if (!selectedPayment) return;
    setLoadingPdf(true);
    try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
        const fontBase64 = await loadFont("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf");
        doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        const studentName = `${data.student.firstName} ${data.student.lastName}`;
        const dateStr = new Date(selectedPayment.date).toLocaleDateString('tr-TR');
        
        doc.setLineWidth(1); doc.rect(5, 5, 200, 138); 
        doc.setFontSize(18); doc.text("BERLINER AKADEMIE", 105, 20, null, null, "center");
        doc.setFontSize(10); doc.text("Dil Kursu ve Danışmanlık Hizmetleri", 105, 26, null, null, "center");
        doc.line(20, 30, 190, 30);
        doc.setFontSize(14); doc.text("TAHSİLAT MAKBUZU", 105, 40, null, null, "center");

        doc.setFontSize(11);
        doc.text("Sayın:", 20, 60); doc.text(studentName, 50, 60);
        doc.text("TC No:", 20, 70); doc.text(data.student.tcIdentity, 50, 70);

        doc.text("Tarih:", 130, 60); doc.text(dateStr, 150, 60);
        doc.text("Makbuz No:", 130, 70); doc.text(`#${Math.floor(Math.random() * 10000)}`, 150, 70); 

        doc.setDrawColor(0); doc.setFillColor(240, 240, 240); 
        doc.rect(20, 85, 170, 20, 'F'); 
        doc.setFontSize(14); doc.setTextColor(0, 0, 0);
        doc.text("ÖDENEN TUTAR:", 30, 98); doc.text(`${selectedPayment.amount} €`, 90, 98);

        doc.setFontSize(11);
        const splitNote = doc.splitTextToSize(`Açıklama: ${receiptNote}`, 170);
        doc.text(splitNote, 20, 115);
        doc.setFontSize(10); doc.text("Teslim Alan (Kaşe/İmza)", 140, 138); 
        
        doc.save(`Makbuz_${data.student.firstName}_${dateStr}.pdf`);
        toast.success("Makbuz oluşturuldu! 🖨️");
        setShowReceiptModal(false);
    } catch (error) { toast.error("Hata oluştu!"); } finally { setLoadingPdf(false); }
  };

  // --- DİĞER İŞLEMLER ---
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (data) {
        setEditForm({
            firstName: data.student.firstName,
            lastName: data.student.lastName,
            tcIdentity: data.student.tcIdentity,
            phone: data.student.phone
        });
    }
  };

  const handleUpdateStudent = async () => {
    try {
        await axios.put(`/api/students/${id}`, editForm);
        toast.success("✅ Bilgiler güncellendi!");
        setIsEditing(false);
        fetchData();
    } catch (error) { toast.error("Güncelleme başarısız!"); }
  };

  const handlePayment = async () => {
    if (!payAmount || payAmount <= 0) return toast.warn("Geçerli tutar girin!");
    try {
      await axios.post('/api/payments/add', { studentId: id, amount: payAmount });
      toast.success('✅ Ödeme Alındı!');
      setPayAmount('');
      fetchData();
    } catch (error) { toast.error('Hata oluştu.'); }
  };

  // --- YENİ SINIF & FİYAT DEĞİŞTİRME FONKSİYONU ---
const handleChangeClass = async () => {
  if(!selectedClass) return toast.warn("Lütfen yeni sınıfı seçin!");

  let confirmMsg = `Öğrenciyi seçilen sınıfa transfer edeceksiniz.`;

  if(resetPayments) {
      confirmMsg += `\n\n⚠️ DİKKAT: "Ödemeleri Sıfırla" seçili!\nEski ödeme geçmişi silinecek ve finansal durum (0 € Ödenen) olarak yeni fiyata göre yeniden başlayacak.`;
  }

  if(!window.confirm(confirmMsg + "\n\nOnaylıyor musunuz?")) return;

  try {
    await axios.post('/api/students/change-class', { 
        studentId: id, 
        newClassId: selectedClass,
        newTotalAmount: newTotalFee,
        resetPayments: resetPayments // Backend'e bu bilgiyi yolluyoruz
    });
    toast.success('✅ Transfer ve Güncelleme Başarılı!');

    // Kutuları temizle
    setNewTotalFee(""); 
    setResetPayments(false);
    fetchData();
  } catch (error) { toast.error('Hata oluştu.'); }
}

  if (!data) return <div className="text-center mt-5">Yükleniyor...</div>;

  const { student, payment } = data;
  const total = payment ? payment.totalAmount : 0;
  const paid = payment ? payment.paidAmount : 0;
  const remaining = total - paid;
  const history = payment ? payment.history : [];
  const notes = student.notes || []; 

  return (
    <div className="container mt-4 mb-5 position-relative">
      
      {/* MAKBUZ MODALI */}
      {showReceiptModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999}}>
          <div className="card shadow-lg" style={{width: '500px'}}>
            <div className="card-header bg-dark text-white d-flex justify-content-between">
              <h5 className="mb-0">🧾 Makbuz Oluştur</h5>
              <button className="btn btn-sm btn-light text-danger" onClick={() => setShowReceiptModal(false)}><FaTimes /></button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Makbuz Açıklaması:</label>
                <textarea className="form-control" rows="3" value={receiptNote} onChange={(e) => setReceiptNote(e.target.value)}></textarea>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-danger" onClick={generateReceipt} disabled={loadingPdf}>
                  {loadingPdf ? 'Hazırlanıyor...' : <><FaPrint className="me-2"/> PDF İndir</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/students" className="btn btn-outline-secondary">← Listeye Dön</Link>
        <span className="badge bg-light text-dark border p-2">Kayıt: {new Date(student.registrationDate).toLocaleDateString('tr-TR')}</span>
      </div>

      <div className="row">
        {/* SOL KOLON */}
        <div className="col-md-5">
          {/* Kimlik Kartı */}
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👤 Öğrenci Bilgileri</h5>
              {!isEditing ? (
                  <button className="btn btn-sm btn-light text-primary fw-bold" onClick={toggleEdit}><FaEdit /> Düzenle</button>
              ) : (
                  <div>
                      <button className="btn btn-sm btn-success me-2" onClick={handleUpdateStudent}><FaSave /></button>
                      <button className="btn btn-sm btn-danger" onClick={toggleEdit}><FaTimes /></button>
                  </div>
              )}
            </div>
            <div className="card-body">
              {isEditing ? (
                  <form>
                      <div className="mb-2"><input type="text" className="form-control" value={editForm.firstName} onChange={(e)=>setEditForm({...editForm, firstName:e.target.value})} placeholder="Ad"/></div>
                      <div className="mb-2"><input type="text" className="form-control" value={editForm.lastName} onChange={(e)=>setEditForm({...editForm, lastName:e.target.value})} placeholder="Soyad"/></div>
                      <div className="mb-2"><input type="text" className="form-control" value={editForm.tcIdentity} onChange={(e)=>setEditForm({...editForm, tcIdentity:e.target.value})} placeholder="TC"/></div>
                      <div className="mb-2"><input type="text" className="form-control" value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone:e.target.value})} placeholder="Tel"/></div>
                  </form>
              ) : (
                  <>
                    <h3 className="card-title text-dark">{student.firstName} {student.lastName}</h3>
                    <p className="card-text mb-1"><strong className="text-muted">TC:</strong> {student.tcIdentity}</p>
                    <p className="card-text"><strong className="text-muted">Tel:</strong> {student.phone}</p>
                  </>
              )}
              <hr />
              <p className="mb-1"><strong>Mevcut Sınıfı:</strong></p>
              {student.currentClass ? (
                 <div className="alert alert-info py-2 fw-bold">{student.currentClass.name} ({student.currentClass.level})</div>
              ) : (
                 <div className="alert alert-warning py-2">Sınıfsız</div>
              )}
            </div>
          </div>

          {/* TRANSFER / KUR DEĞİŞİMİ KARTI (SARI KUTU) */}
          <div className="card shadow mb-4 border-warning">
            <div className="card-header bg-warning text-dark d-flex align-items-center">
                <h6 className="mb-0 fw-bold"><FaExchangeAlt className="me-2"/>Kur / Sınıf Geçişi</h6>
            </div>
            <div className="card-body">
              
              <div className="mb-2">
                <label className="small text-muted fw-bold">1. Yeni Sınıfı Seçin:</label>
                <select className="form-select" onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="">Sınıf Seç...</option>
                    {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>{cls.name} ({cls.level})</option>
                    ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="small text-muted fw-bold">2. Yeni Toplam Ücret (Opsiyonel):</label>
                <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Değişmeyecekse boş bırakın..." 
                    value={newTotalFee}
                    onChange={(e) => setNewTotalFee(e.target.value)}
                />
                <small className="text-muted" style={{fontSize: '0.7rem'}}>
                    *Girilirse, toplam borç bu rakamla güncellenir.
                </small>
              </div>

              <button className="btn btn-dark w-100 fw-bold" onClick={handleChangeClass}>
                  Değişiklikleri Kaydet
              </button>
            </div>
          </div>
          <div className="form-check mb-3 bg-white p-2 rounded border">
              <input 
                  className="form-check-input ms-1" 
                  type="checkbox" 
                  id="resetCheck"
                  checked={resetPayments}
                  onChange={(e) => setResetPayments(e.target.checked)}
              />
              <label className="form-check-label ms-2 text-danger fw-bold small" htmlFor="resetCheck">
                  Yeni Dönem Başlat (Eski Ödemeleri Sıfırla)
              </label>
              <div className="text-muted small ms-4" style={{fontSize:'0.7rem'}}>
                  *İşaretlenirse: Eski "Ödenen Tutar" sıfırlanır ve ödeme geçmişi temizlenir. Eski veriler "Notlar" kısmına arşivlenir.
              </div>
          </div>

          <button className="btn btn-dark w-100 fw-bold" onClick={handleChangeClass}>
              Değişiklikleri Kaydet
          </button>
          <br/>
          {/* ÖDEME GEÇMİŞİ */}
          <div className="card shadow mb-4">
            <div className="card-header bg-secondary text-white"><h6 className="mb-0">📜 Ödeme Geçmişi</h6></div>
            <ul className="list-group list-group-flush" style={{maxHeight: '200px', overflowY: 'auto'}}>
              {history.slice().reverse().map((h, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold text-dark d-block">{new Date(h.date).toLocaleDateString('tr-TR')}</span>
                    <small className="text-muted">{h.note}</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold text-success me-3">+{h.amount} €</span>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleOpenReceiptModal(h)}><FaFilePdf /></button>
                  </div>
                </li>
              ))}
              {history.length === 0 && <li className="list-group-item text-center">Ödeme yok.</li>}
            </ul>
          </div>
        </div>

        {/* SAĞ KOLON (FİNANS ve NOTLAR) */}
        <div className="col-md-7">
          
          {/* FİNANS KARTI */}
          <div className="card shadow border-0 mb-4">
            <div className="card-header bg-success text-white"><h5 className="mb-0">💰 Finansal Durum</h5></div>
            <div className="card-body">
              <div className="row text-center mb-4">
                <div className="col-4"><div className="p-3 border rounded bg-light"><small>Toplam</small><h4 className="text-dark">{total} €</h4></div></div>
                <div className="col-4"><div className="p-3 border rounded bg-light"><small>Ödenen</small><h4 className="text-success">{paid} €</h4></div></div>
                <div className="col-4"><div className="p-3 border rounded bg-danger text-white"><small>KALAN</small><h4 className="fw-bold">{remaining} €</h4></div></div>
              </div>
              {remaining > 0 ? (
                <div className="p-4 border rounded bg-light">
                  <label className="form-label fw-bold">Tahsilat Yap</label>
                  <div className="input-group">
                    <input type="number" className="form-control form-control-lg" placeholder="Tutar" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}/>
                    <button className="btn btn-success btn-lg" onClick={handlePayment}>Onayla ✅</button>
                  </div>
                </div>
              ) : (
                <div className="alert alert-success text-center"><h4>🎉 Borcu Yok!</h4></div>
              )}
            </div>
          </div>

          {/* --- ÖZEL NOTLAR --- */}
          <div className="card shadow border-0" style={{backgroundColor: '#fffbeb', borderLeft: '5px solid #ffc107'}}>
            <div className="card-header bg-transparent border-0 d-flex align-items-center">
                <h5 className="mb-0 text-warning fw-bold"><FaStickyNote className="me-2"/>Özel Notlar</h5>
            </div>
            <div className="card-body">
                {/* Not Ekleme */}
                <div className="input-group mb-3">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Örn: Velisi ile görüşüldü..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button className="btn btn-warning text-dark fw-bold" onClick={handleAddNote}>+ Ekle</button>
                </div>

                {/* Not Listesi */}
                <ul className="list-group list-group-flush">
                    {notes.slice().reverse().map((note) => (
                        <li key={note._id} className="list-group-item bg-transparent d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                                <div style={{whiteSpace: 'pre-wrap'}}>{note.text}</div>
                                <small className="text-muted" style={{fontSize:'0.75rem'}}>
                                    {new Date(note.date).toLocaleDateString('tr-TR')} {new Date(note.date).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                                </small>
                            </div>
                            <button 
                                className="btn btn-sm text-danger opacity-50 hover-opacity-100" 
                                title="Notu Sil"
                                onClick={() => handleDeleteNote(note._id)}
                            >
                                <FaTrashAlt />
                            </button>
                        </li>
                    ))}
                    {notes.length === 0 && <li className="list-group-item bg-transparent text-muted text-center fst-italic">Henüz not eklenmemiş.</li>}
                </ul>
            </div>
          </div>
          {/* ------------------------------- */}

        </div>
      </div>
    </div>
  );
};

export default StudentDetail;