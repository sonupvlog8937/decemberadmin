import React, { useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdClose } from 'react-icons/io';
import {
  FaExclamationCircle, FaCheckCircle, FaStar, FaRegStar, FaGripLinesVertical,
  FaChevronDown, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { deleteImages } from '../utils/api';
import UploadBox from './UploadBox';
import './productUi.css';

/* ---------- page shell + header ---------- */
export const FormShell = ({ theme = 'green', badgeIcon, badge, title, subtitle, percent, extra, children }) => (
  <section className={`pf-root pf-${theme}`}>
    <div className="pf-wrap">
      <header className="pf-head">
        <div>
          <span className="pf-badge">{badgeIcon}{badge}</span>
          <h1 className="pf-title">{title}</h1>
          <p className="pf-sub">{subtitle}</p>
        </div>
        {percent !== undefined && (
          <div className="pf-prog">
            <div className="pf-prog-top">
              <span>Progress</span>
              <b className={`pf-chip${percent === 100 ? ' done' : ''}`}>
                {percent === 100 && <FaCheckCircle size={10} />} {percent}%
              </b>
            </div>
            <div className="pf-track"><div className="pf-fill" style={{ width: `${percent}%` }} /></div>
            {extra}
          </div>
        )}
      </header>
      {children}
    </div>
  </section>
);

/* ---------- cards ---------- */
export const Card = ({ icon, title, sub, right, error, innerRef, collapsible, open, onToggle, children, className = '' }) => {
  const Head = collapsible ? 'button' : 'div';
  const headProps = collapsible ? { type: 'button', onClick: onToggle, 'aria-expanded': open } : {};
  return (
    <div ref={innerRef} className={`pf-card${error ? ' pf-card-err' : ''} ${className}`}>
      {title && (
        <Head className={`pf-card-head${collapsible ? ' pf-collapsible' : ''}`} {...headProps}>
          <span className="pf-card-left">
            <span className="pf-ico">{icon}</span>
            <span>
              <span className="pf-card-title">{title}</span>
              {sub && <span className="pf-card-sub">{sub}</span>}
            </span>
          </span>
          <span className="pf-card-right">
            {right}
            {collapsible && <FaChevronDown size={12} className={`pf-chev${open ? ' open' : ''}`} />}
          </span>
        </Head>
      )}
      {(!collapsible || open) && <div className={title ? 'pf-card-body' : ''}>{children}</div>}
    </div>
  );
};

export const ShopBanner = ({ icon, eyebrow, name, address }) => (
  <div className="pf-card pf-banner">
    <div className="pf-banner-ico">{icon}</div>
    <div>
      <div className="pf-eyebrow">{eyebrow}</div>
      <div className="pf-banner-name">{name}</div>
      <div className="pf-banner-addr">{address}</div>
    </div>
  </div>
);

/* ---------- inputs ---------- */
export const Field = ({ label, error, hint, count, limit, innerRef, children, className = '' }) => (
  <div ref={innerRef} className={`pf-field ${className}`}>
    {label && (
      <div className="pf-lrow">
        <label className="pf-label">{label}</label>
        {limit && <span className={`pf-count${count > limit ? ' warn' : ''}`}>{count}/{limit}</span>}
      </div>
    )}
    {children}
    {error && <div className="pf-err"><FaExclamationCircle size={11} /> {error}</div>}
    {hint && !error && <div className="pf-hint">{hint}</div>}
  </div>
);

export const Input = ({ error, className = '', ...p }) => (
  <input className={`pf-input${error ? ' has-err' : ''} ${className}`} {...p} />
);
export const TextArea = ({ error, className = '', ...p }) => (
  <textarea className={`pf-input pf-textarea${error ? ' has-err' : ''} ${className}`} {...p} />
);
export const Pick = ({ error, children, ...p }) => (
  <Select size="small" fullWidth displayEmpty error={!!error} {...p}>{children}</Select>
);

export const Toggle = ({ name, checked, onChange, label, hint }) => (
  <label className="pf-toggle">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} />
    <span className="pf-switch" />
    <span><b>{label}</b>{hint && <em>{hint}</em>}</span>
  </label>
);

/* ---------- SEO block ---------- */
export const SEO_KEYS = ['searchKeywords', 'tags', 'keywords', 'seoDescription', 'attributes'];
export const seoFilled = (form) => SEO_KEYS.filter((k) => form[k]?.trim()).length;

export const SeoFields = ({ form, onChange, ph = {}, descLimit = 160 }) => (
  <>
    <Field label="Search keywords" hint="Words people might search to find this item">
      <Input name="searchKeywords" value={form.searchKeywords} onChange={onChange} placeholder={ph.searchKeywords} />
    </Field>
    <div className="pf-row2" style={{ marginBottom: 14 }}>
      <Field label="Tags"><Input name="tags" value={form.tags} onChange={onChange} placeholder={ph.tags} /></Field>
      <Field label="SEO keywords"><Input name="keywords" value={form.keywords} onChange={onChange} placeholder={ph.keywords} /></Field>
    </div>
    <Field label="SEO description" count={form.seoDescription.length} limit={descLimit}>
      <TextArea name="seoDescription" value={form.seoDescription} onChange={onChange} placeholder={ph.seoDescription} style={{ minHeight: 70 }} />
    </Field>
    <Field label="Attributes" hint="key: value format, one per line">
      <TextArea name="attributes" value={form.attributes} onChange={onChange} placeholder={ph.attributes} style={{ minHeight: 70 }} />
    </Field>
  </>
);

/* ---------- category block ---------- */
export const CategoryFields = ({
  categories, subCategories, subSubCategories, categoryId, subCategoryId, subSubCategoryId,
  onCategory, onSub, onSubSub, error, emptyText, innerRef,
}) => {
  if (!categories.length) return <div className="pf-warn">{emptyText}</div>;
  return (
    <>
      <div className="pf-row2">
        <Field label="Category *" error={error} innerRef={innerRef}>
          <Pick value={categoryId} onChange={(e) => onCategory(e.target.value)} error={error}>
            <MenuItem value="" disabled>Select category</MenuItem>
            {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </Pick>
        </Field>
        <Field label="Sub category">
          <Pick value={subCategoryId} onChange={(e) => onSub(e.target.value)} disabled={!categoryId}>
            <MenuItem value="">Optional</MenuItem>
            {subCategories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </Pick>
        </Field>
      </div>
      {subSubCategories && subCategories.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Field label="Sub-sub category">
            <Pick value={subSubCategoryId} onChange={(e) => onSubSub(e.target.value)} disabled={!subCategoryId}>
              <MenuItem value="">Optional</MenuItem>
              {subSubCategories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </Pick>
          </Field>
        </div>
      )}
    </>
  );
};

/* ---------- photos (drag, arrows, make cover) ---------- */
export const PhotoGrid = ({ previews, setPreviews, max, error, onChanged }) => {
  const from = useRef(null);
  const [over, setOver] = useState(null);
  const changed = () => onChanged && onChanged();

  const add = (arr) => {
    setPreviews((p) => {
      const next = [...new Set([...p, ...arr])];
      return max ? next.slice(0, max) : next;
    });
    changed();
  };
  const remove = (img, i) =>
    deleteImages(`/api/category/deteleImage?img=${img}`).then(() => {
      setPreviews((p) => p.filter((_, x) => x !== i));
      changed();
    });
  const reorder = (a, b) => {
    if (a === null || b === null || a === b || b < 0) return;
    setPreviews((p) => {
      if (b >= p.length) return p;
      const n = [...p];
      const [m] = n.splice(a, 1);
      n.splice(b, 0, m);
      return n;
    });
    changed();
  };

  return (
    <>
      <div className="pf-photos">
        {previews.map((img, i) => (
          <div
            key={img + i}
            className={`pf-tile${over === i && from.current !== i ? ' over' : ''}`}
            draggable
            onDragStart={() => { from.current = i; }}
            onDragOver={(e) => { e.preventDefault(); if (over !== i) setOver(i); }}
            onDrop={() => { reorder(from.current, i); from.current = null; setOver(null); }}
            onDragEnd={() => { from.current = null; setOver(null); }}
          >
            <button type="button" className="pf-tile-x" onClick={() => remove(img, i)} aria-label="Remove photo">
              <IoMdClose size={13} />
            </button>
            <div className="pf-tile-frame">
              <img src={img} alt="" />
              {i === 0
                ? <span className="pf-cover"><FaStar size={8} /> Cover</span>
                : <button type="button" className="pf-makecover" onClick={() => reorder(i, 0)}><FaRegStar size={9} /> Make cover</button>}
              <span className="pf-grip"><FaGripLinesVertical size={10} /></span>
            </div>
            <div className="pf-arrows">
              <button type="button" disabled={i === 0} onClick={() => reorder(i, i - 1)} aria-label="Move left"><FaChevronLeft size={9} /></button>
              <button type="button" disabled={i === previews.length - 1} onClick={() => reorder(i, i + 1)} aria-label="Move right"><FaChevronRight size={9} /></button>
            </div>
          </div>
        ))}
        {(!max || previews.length < max) && (
          <UploadBox multiple name="images" url="/api/product/uploadImages" setPreviewsFun={add} />
        )}
      </div>
      {error && <div className="pf-err" style={{ marginTop: 10 }}><FaExclamationCircle size={11} /> {error}</div>}
    </>
  );
};

/* ---------- live preview ---------- */
export const PreviewCard = ({ image, fallbackIcon, title, tag, tagTone, desc, price, strike, unit, footer, footerOk, checklist }) => (
  <aside className="pf-aside">
    <div className="pf-card pf-prev">
      <div className="pf-prev-eyebrow">Live preview</div>
      <div className="pf-prev-media">
        <div className="pf-prev-img" style={image ? { backgroundImage: `url("${image}")` } : undefined}>{!image && fallbackIcon}</div>
        <div className="pf-prev-body">
          <div className="pf-prev-name">{title}{tag && <span className={`pf-tag ${tagTone || ''}`}>{tag}</span>}</div>
          <div className="pf-prev-desc">{desc}</div>
          <div className="pf-prev-price">
            <b>{price}</b>{strike && <s>{strike}</s>}{unit && <i>{unit}</i>}
          </div>
          {footer && <div className={`pf-prev-foot ${footerOk ? 'ok' : 'bad'}`}>{footer}</div>}
        </div>
      </div>
      <ul className="pf-check">
        {checklist.map((c, i) => (
          <li key={i} className={c.done ? 'done' : ''}><FaCheckCircle size={13} /> {c.label}</li>
        ))}
      </ul>
    </div>
  </aside>
);

/* ---------- sticky action bar (put INSIDE the <form>) ---------- */
export const ActionBar = ({ percent, saving, saved, label, icon, onCancel, cancelIcon }) => (
  <div className="pf-bar">
    <div className="pf-bar-prog">
      <span>{percent}% complete</span>
      <div className="pf-track"><div className="pf-fill" style={{ width: `${percent}%` }} /></div>
    </div>
    {onCancel && (
      <button type="button" className="pf-btn-ghost" onClick={onCancel}>{cancelIcon}<span>Cancel</span></button>
    )}
    <button type="submit" disabled={saving} className={`pf-btn${saved ? ' saved' : ''}`}>
      {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : saved ? <><FaCheckCircle size={14} /> Saved</> : <>{icon} {label}</>}
    </button>
  </div>
);

/* ---------- loading / empty ---------- */
export const FormSkeleton = () => (
  <div>
    <div className="pf-skel" /><div className="pf-skel" /><div className="pf-skel" style={{ height: 190 }} />
  </div>
);

export const EmptyState = ({ icon, title, text }) => (
  <div className="pf-card pf-empty">{icon}<h3>{title}</h3><p>{text}</p></div>
);