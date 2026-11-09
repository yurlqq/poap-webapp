import 'regenerator-runtime/runtime';
import './mock-api';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter,Route,Switch,Link,Redirect,useLocation} from 'react-router-dom';
import {ToastProvider} from 'react-toast-notifications';
import ReactModal from 'react-modal';
import {EventsPage} from '../src/backoffice/EventsPage';
import {Deliveries} from '../src/backoffice/Deliveries';
import {WebsitesManage} from '../src/backoffice/Websites/WebsitesManage';
import logo from '../src/images/POAP.svg';
import '../src/scss/main.scss';
import './preview.css';
ReactModal.setAppElement('#root');
function App(){const location=useLocation();return <>
<div className="preview-notice">LOCAL PREVIEW · 구형 POAP 원본 UI · 이 브라우저에만 저장됩니다. 실제 발급은 하지 않습니다.</div>
<header className="preview-header"><img src={logo} width="100"/><nav><Link to="/admin/events">Manage Events</Link><Link to="/admin/deliveries">Manage Deliveries</Link><Link to="/admin/websites">Manage Websites</Link></nav></header>
<div className="preview-help">같은 POAP 샘플: <b>Event ID 1001</b> · Edit Code <b>123456</b> · <a href="/images/badges/ethdenver2019_512.png" download="sample-badge.png">샘플 PNG 내려받기</a><button onClick={()=>{if(confirm('로컬 데이터를 초기화할까요?')){localStorage.removeItem('poap-local-v1');window.location.href='/admin/events';}}}>샘플 초기화</button></div>
<main className="app-content backoffice"><div className="container"><Switch>
<Route path="/admin/events" component={EventsPage}/><Route path="/admin/deliveries" component={Deliveries}/><Route path="/admin/websites" render={()=><WebsitesManage key={location.key}/>}/>
<Route path="/local-claim" render={()=><p>이 미리보기는 발급자 관리 화면용입니다. 실제 수령·민팅은 연결되어 있지 않습니다.</p>}/><Redirect to="/admin/events"/>
</Switch></div></main></>}
ReactDOM.render(<ToastProvider><BrowserRouter><App/></BrowserRouter></ToastProvider>,document.getElementById('root'));
