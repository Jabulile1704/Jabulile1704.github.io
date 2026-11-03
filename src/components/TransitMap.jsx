import { useState } from 'react'
import { certCount, builds } from '../data.js'

// Same geometry as the profile README map (Jabulile1704/scripts/build-map.mjs).
const CY = 190 // career line, top
const BY = 350 // build line
const CY2 = 510 // career line, bottom
const XY = 620 // cert line

const career = [
  { x: 60, y: CY, name: 'CUT', sub: 'Adv. Diploma in IT', up: true, anchor: 'start', href: '#career-cut-adv' },
  { x: 290, y: CY, name: 'WWISE', sub: 'facilitator · 2025–26', up: true, href: '#career-wwise' },
  { x: 480, y: CY2, name: 'Mashibini Tech', sub: 'founder · since 2025', href: '#career-mashibini-tech' },
  { x: 640, y: CY2, name: 'SETA Assessor', sub: 'ETDP registered', up: true, href: '#career' },
]

const build = [
  { x: 60, id: 'az104', sub: 'Azure · Entra ID', up: true, anchor: 'start' },
  { x: 160, id: 'tiro', sub: 'Flutter · Firebase' },
  { x: 265, id: 'freshfadez', sub: 'Flutter UI', up: true },
  { x: 470, id: 'unittesting', sub: 'C# · .NET tests' },
  { x: 570, id: 'mzansi', sub: 'C# · WinForms · MSTest', up: true },
  { x: 670, id: 'robotics', sub: 'Arduino · C++' },
  { x: 765, id: 'robotoremote', sub: 'C# ↔ Arduino', up: true },
  { x: 860, id: 'yetsa', sub: 'Swift · SwiftUI' },
  { x: 960, id: 'zaka', sub: 'Swift · SwiftData', up: true },
  { x: 1050, id: 'motiroong', sub: 'gov client · in build', big: true },
  { x: 1140, id: 'prayer', sub: 'family prayer rota', up: true, anchor: 'end', dashed: true, labelX: 1152 },
].map((s) => ({ ...s, y: BY, name: builds.find((b) => b.id === s.id).name, href: `#build-${s.id}` }))

const cert = [
  { x: 60, name: 'Fundamentals', sub: 'AZ/SC/DP-900 · Cisco', anchor: 'start' },
  { x: 260, name: 'AWS · OCI', sub: 'CCP · OCI Foundations', up: true },
  { x: 460, name: 'Associate ×5', sub: 'AZ-104 AZ-204 AI-200 DP-700 PL-300' },
  { x: 660, name: 'AZ-140', sub: 'Virtual Desktop specialty', up: true },
  { x: 860, name: 'Security', sub: 'SC-200 SC-300 ISO 27001' },
].map((s) => ({ ...s, y: XY, href: '#certs' }))

const LINES = [
  { key: 'career', label: 'Career line' },
  { key: 'build', label: 'Build line' },
  { key: 'cert', label: 'Cert line' },
]

function Station({ s, line, focus, setFocus }) {
  const r = s.big ? 12 : 9
  const nameY = s.up ? s.y - 40 : s.y + 34
  const lx = s.labelX ?? s.x
  const a = s.anchor ?? 'middle'
  return (
    <a
      href={s.href}
      className={`tm-station tm-${line}`}
      aria-label={`${s.name}, ${s.sub}`}
      onMouseEnter={() => setFocus(line)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(line)}
      onBlur={() => setFocus(null)}
      data-dim={focus && focus !== line ? '' : undefined}
    >
      <circle className="tm-hit" cx={s.x} cy={s.y} r="22" />
      <circle
        className="tm-dot"
        cx={s.x}
        cy={s.y}
        r={r}
        strokeWidth={s.big ? 6 : 5}
        strokeDasharray={s.dashed ? '4 4' : undefined}
      />
      <text className="tm-name" x={lx} y={nameY} textAnchor={a}>
        {s.name}
      </text>
      <text className="tm-sub" x={lx} y={nameY + 16} textAnchor={a}>
        {s.sub}
      </text>
    </a>
  )
}

function Interchange({ x, y, name, sub, href, labelX, labelY, anchor = 'middle', focus, setFocus }) {
  return (
    <a
      href={href}
      className="tm-station tm-ix"
      aria-label={`${name}, ${sub}`}
      onMouseEnter={() => setFocus('ix')}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus('ix')}
      onBlur={() => setFocus(null)}
      data-dim={focus && focus !== 'ix' && focus !== 'career' ? '' : undefined}
    >
      <circle className="tm-hit" cx={x} cy={y} r="24" />
      <circle className="tm-dot" cx={x} cy={y} r="13" strokeWidth="5" />
      <text className="tm-name" x={labelX} y={labelY} textAnchor={anchor}>
        {name}
      </text>
      <text className="tm-sub" x={labelX} y={labelY + 16} textAnchor={anchor}>
        {sub}
      </text>
    </a>
  )
}

export default function TransitMap() {
  const [focus, setFocus] = useState(null)
  const dim = (line) => (focus && focus !== line && focus !== 'ix' ? '' : undefined)
  const props = { focus, setFocus }

  return (
    <figure className="tm">
      <div className="tm__scroll">
        <svg
          className="tm__svg"
          viewBox="0 118 1200 572"
          role="group"
          aria-label="Transit map of career, build and certification lines. Each station links to its section."
        >
          <g className="tm-line tm-career" data-dim={dim('career')}>
            <path d={`M60 ${CY} H310 Q370 ${CY} 370 ${CY + 70} V${CY2 - 70} Q370 ${CY2} 440 ${CY2} H1100`} />
          </g>
          <g className="tm-line tm-build" data-dim={dim('build')}>
            <path d={`M60 ${BY} H1050`} />
            <path d={`M1050 ${BY} H1140`} className="tm-dotted" />
          </g>
          <g className="tm-line tm-cert" data-dim={dim('cert')}>
            <path d={`M60 ${XY} H1030 Q1100 ${XY} 1100 ${XY - 70} V${CY2 + 10}`} />
          </g>

          {career.map((s) => (
            <Station key={s.name} s={s} line="career" {...props} />
          ))}
          {build.map((s) => (
            <Station key={s.id} s={s} line="build" {...props} />
          ))}
          {cert.map((s) => (
            <Station key={s.name} s={s} line="cert" {...props} />
          ))}
          <Interchange x={370} y={BY} name="CTU" sub="facilitator · now" href="#career-ctu" labelX={388} labelY={BY + 74} anchor="start" {...props} />
          <Interchange x={1100} y={CY2} name="MCT" sub="certified trainer" href="#certs" labelX={1100} labelY={CY2 - 34} {...props} />
        </svg>
      </div>

      <figcaption className="tm__legend">
        {LINES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`tm__key tm-${key}`}
            aria-pressed={focus === key}
            onMouseEnter={() => setFocus(key)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(key)}
            onBlur={() => setFocus(null)}
            onClick={() => setFocus((f) => (f === key ? null : key))}
          >
            <span className="tm__swatch" />
            {label}
          </button>
        ))}
        <span className="tm__key tm__key--static">
          <span className="tm__ring" />
          Interchange
        </span>
        <span className="tm__count">
          {certCount} certs · {builds.length} builds
        </span>
      </figcaption>
      <p className="tm__hint">Swipe the map sideways to see every stop.</p>
    </figure>
  )
}
