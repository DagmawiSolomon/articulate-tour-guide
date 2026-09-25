"use client";
import * as React from "react";

type Work = { id: string; number: string; title: string; artist: string; room: string; image: string; x: number; y: number };
type Floor = { outline: string; walls: string[]; rooms: { label: string; x: number; y: number }[]; works: Work[] };
const floors: Record<1 | 2, Floor> = {
  1: {
    outline: "M 92 150 H 316 V 92 H 462 V 216 H 1090 V 488 H 1002 L 1072 554 L 978 634 L 786 600 L 438 634 V 514 H 218 V 430 H 92 Z",
    walls: ["M218 150V430","M316 150V216","M462 216V600","M650 216V370","M846 216V488","M462 370H846","M462 488H1002","M650 370V488"],
    rooms: [{label:"ENTRY",x:143,y:305},{label:"GALLERY 01",x:338,y:250},{label:"GALLERY 02",x:500,y:250},{label:"GALLERY 03",x:696,y:250},{label:"GALLERY 04",x:895,y:250},{label:"GALLERY 05",x:498,y:405},{label:"GALLERY 06",x:700,y:405},{label:"EAST WING",x:896,y:530}],
    works: [
      {id:"starry",number:"01",title:"The Starry Night",artist:"Vincent van Gogh · 1889",room:"Gallery 01",image:"/starry-night.jpg",x:360,y:324},
      {id:"lilies",number:"02",title:"Water Lilies",artist:"Claude Monet · 1916",room:"Gallery 02",image:"/water-lilies.jpg",x:548,y:312},
      {id:"sunflowers",number:"03",title:"Sunflowers",artist:"Vincent van Gogh · 1888",room:"Gallery 03",image:"/sunflowers.jpg",x:744,y:312},
      {id:"annunciation",number:"04",title:"The Annunciation",artist:"Fra Angelico · 1433",room:"Gallery 04",image:"/vermeer-study.jpg",x:956,y:312},
      {id:"potato",number:"05",title:"The Potato Eaters",artist:"Vincent van Gogh · 1885",room:"Gallery 05",image:"/assets/timeline/nuenen.jpg",x:548,y:442},
      {id:"portrait",number:"06",title:"Self-Portrait in a Grey Felt Hat",artist:"Vincent van Gogh · 1887",room:"Gallery 06",image:"/assets/timeline/paris.jpg",x:744,y:442},
      {id:"arles",number:"07",title:"Sunflowers and Yellow House",artist:"Vincent van Gogh · 1888",room:"East Wing",image:"/assets/timeline/arles.jpg",x:904,y:560}
    ]
  },
  2: {
    outline: "M 96 158 L 316 214 V 166 H 474 V 250 H 1082 V 434 L 920 482 L 840 606 L 510 566 H 382 V 474 H 226 V 404 L 96 370 Z",
    walls: ["M226 190V404","M382 210V474","M566 250V392","M754 250V412","M934 250V478","M382 392H934","M566 392V550","M754 412V576"],
    rooms: [{label:"WEST GALLERY",x:254,y:282},{label:"GALLERY 07",x:418,y:284},{label:"GALLERY 08",x:612,y:286},{label:"GALLERY 09",x:800,y:286},{label:"GALLERY 10",x:976,y:286},{label:"GALLERY 11",x:446,y:438},{label:"GALLERY 12",x:646,y:438},{label:"SOUTH WING",x:830,y:520}],
    works: [
      {id:"study",number:"07",title:"The Starry Night (Study)",artist:"Vincent van Gogh · 1889",room:"Gallery 07",image:"/starry-night-sketch.jpg",x:456,y:330},
      {id:"crows",number:"08",title:"Wheatfield with Crows",artist:"Vincent van Gogh · 1890",room:"Gallery 08",image:"/assets/timeline/auvers.jpg",x:662,y:330},
      {id:"lilies2",number:"09",title:"Water Lilies",artist:"Claude Monet · 1916",room:"Gallery 09",image:"/water-lilies.jpg",x:846,y:330},
      {id:"sunflowers2",number:"10",title:"Sunflowers",artist:"Vincent van Gogh · 1888",room:"Gallery 10",image:"/sunflowers.jpg",x:1010,y:338},
      {id:"potato2",number:"11",title:"The Potato Eaters",artist:"Vincent van Gogh · 1885",room:"Gallery 11",image:"/assets/timeline/nuenen.jpg",x:468,y:468},
      {id:"studio",number:"12",title:"The Studio of the South",artist:"Vincent van Gogh · 1888",room:"Gallery 12",image:"/assets/timeline/arles.jpg",x:660,y:478},
      {id:"paris",number:"13",title:"Self-Portrait in Paris",artist:"Vincent van Gogh · 1887",room:"South Wing",image:"/assets/timeline/paris.jpg",x:830,y:540}
    ]
  }
};

export function ExhibitFloorMapView() {
  const [floor, setFloor] = React.useState<1 | 2>(1);
  const [selected, setSelected] = React.useState<Work | null>(null);
  const plan = floors[floor];
  return (
    <section className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] bg-[#fbfbfa] font-sans text-[#20211f]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e4e1] px-4 py-3 pr-14 sm:px-6 sm:pr-16">
        <div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#737772]">Turning Points in Art History</p><h2 className="mt-0.5 font-outfit text-lg font-normal leading-tight sm:text-xl">Exhibition map</h2></div>
        <div role="group" className="flex items-center gap-1 rounded-full border border-[#e2e4e1] bg-white p-1" aria-label="Choose a floor">
          {([1,2] as const).map((n) => <button key={n} type="button" onClick={() => {setFloor(n);setSelected(null);}} aria-pressed={floor===n} className={floor===n ? "rounded-full bg-[#20211f] px-3 py-1.5 text-xs text-white" : "rounded-full px-3 py-1.5 text-xs text-[#4e514e] hover:bg-[#f0f1ef]"}><span className="mr-1.5 font-medium">0{n}</span>{n===1?"First floor":"Second floor"}</button>)}
        </div>
      </header>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_15.5rem] md:grid-rows-1">
        <div className="relative min-h-0 overflow-hidden p-2 sm:p-4 md:pb-[4.5rem]">
          <svg viewBox="0 0 1200 680" preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="group" aria-label={"Interactive gallery floor plan, floor " + floor}>
            <defs>
              <pattern id="map-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.35" fill="#c7cbc8"/></pattern>
              <pattern id="floor-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" fill="#c3c8c4"/></pattern>
              <clipPath id={"footprint-" + floor}><path d={plan.outline}/></clipPath>
              {plan.works.map((w)=><clipPath id={"art-" + w.id} key={w.id}><circle cx={w.x} cy={w.y} r="29"/></clipPath>)}
            </defs>
            <rect width="1200" height="680" fill="#fbfbfa"/><rect width="1200" height="680" fill="url(#map-dots)" opacity=".75"/>
            <path d={plan.outline} fill="#edf0ed" stroke="#282b29" strokeWidth="4" strokeLinejoin="round"/>
            <path d={plan.outline} fill="url(#floor-dots)" clipPath={"url(#footprint-" + floor + ")"} opacity=".8"/>
            {plan.walls.map((d)=><path key={d} d={d} fill="none" stroke="#555a56" strokeWidth="2.5" strokeLinecap="square"/>)}
            {plan.rooms.map((r)=><text key={r.label} x={r.x} y={r.y} textAnchor="middle" fill="#777c78" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="500" letterSpacing="1.5">{r.label}</text>)}
            {floor === 1 && <text x="110" y="455" fill="#555a56" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="500" letterSpacing="1.4">MAIN ENTRY</text>}
            {plan.works.map((w)=>{
              const active=selected?.id===w.id;
              return <g key={w.id} role="button" tabIndex={0} aria-label={w.title+", "+w.artist+", "+w.room} aria-pressed={active} onClick={()=>setSelected(w)} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(w);}}} className="cursor-pointer">
                <title>{w.title+" · "+w.room}</title>
                <circle cx={w.x} cy={w.y} r="35" fill="white" stroke={active?"#171918":"#626762"} strokeWidth={active?4:2}/>
                <image href={w.image} x={w.x-29} y={w.y-29} width="58" height="58" preserveAspectRatio="xMidYMid slice" clipPath={"url(#art-"+w.id+")"}/>
                <circle cx={w.x+23} cy={w.y+23} r="11" fill="#20211f" stroke="white" strokeWidth="2"/>
                <text x={w.x+23} y={w.y+26.5} textAnchor="middle" fill="white" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" pointerEvents="none">{w.number}</text>
                <text x={w.x} y={w.y+51} textAnchor="middle" fill="#333734" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" pointerEvents="none">{w.title.length>20?w.title.slice(0,18)+"…":w.title}</text>
              </g>;
            })}
          </svg>
        </div>
        <aside className="flex min-h-[6.5rem] items-center gap-3 border-t border-[#e2e4e1] bg-white px-4 py-3 md:min-h-0 md:flex-col md:items-start md:justify-center md:border-l md:border-t-0 md:px-5">
          {selected ? <><img src={selected.image} alt="" className="size-14 shrink-0 rounded-full border border-[#d8dcd8] object-cover sm:size-16 md:size-24"/><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#777c78]">{selected.room}</p><h3 className="mt-1 font-outfit text-base font-medium leading-tight text-[#20211f] md:text-lg">{selected.title}</h3><p className="mt-1 text-xs leading-relaxed text-[#686d69]">{selected.artist}</p></div></> : <div className="flex items-center gap-3 md:flex-col md:items-start"><span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-[#9ba19c] text-xs text-[#777c78]">01</span><div><p className="font-outfit text-sm font-medium">Choose a painting</p><p className="mt-1 max-w-[18rem] text-xs leading-relaxed text-[#686d69]">Select a circular artwork marker to see its title, artist, and room.</p></div></div>}
        </aside>
      </div>
    </section>
  );
}
