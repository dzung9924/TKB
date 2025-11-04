// script.js - simple UI to show schedule from public/schedule.json
(async () => {
  const hocKySelect = document.getElementById('hocKy');
  const loadBtn = document.getElementById('loadBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const statusEl = document.getElementById('status');
  const tbody = document.querySelector('#tkbTable tbody');
  const noData = document.getElementById('noData');

  function setStatus(text) { statusEl.textContent = text || ''; }

  async function loadSchedule() {
    setStatus('Đang tải public/schedule.json ...');
    try {
      const res = await fetch('/schedule.json?ts=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const data = json.response?.data || json.response || json;
      const weeks = data?.ds_tuan_tkb || [];
      tbody.innerHTML = '';
      if (!weeks || weeks.length === 0) {
        noData.style.display = 'block';
        setStatus('Không có tuần trong dữ liệu.');
        return;
      }
      noData.style.display = 'none';
      weeks.forEach(w => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = w.tuan_hoc_ky ?? w.tuan ?? w.tuan_tuyet_doi ?? '';
        const td2 = document.createElement('td');
        td2.textContent = w.mo_ta || w.ghi_chu || w.ten || JSON.stringify(w);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
      });
      setStatus('Đã tải ' + weeks.length + ' tuần. fetched_at: ' + (json.fetched_at || 'n/a'));
    } catch (err) {
      console.error(err);
      setStatus('Lỗi tải dữ liệu: ' + (err.message || err));
    }
  }

  loadBtn.addEventListener('click', loadSchedule);
  refreshBtn.addEventListener('click', loadSchedule);

  // auto load on open
  loadSchedule();
})();
