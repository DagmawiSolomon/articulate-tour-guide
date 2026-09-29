"use client";

import * as React from "react";
import Image from "next/image";
import type * as MapLibreGL from "maplibre-gl";
import { Map, MapControls, MapMarker, type MapViewport } from "@/components/ui/map";
import type { ArtworkMetadataField } from "./artwork-info-card";

export interface ExhibitArtworkInfo {
  id?: string;
  title: string;
  imageSrc: string;
  summary: string;
  metadata: ArtworkMetadataField[];
}

export interface ExhibitNavigationState {
  currentLocationId: string;
  routeOriginId: string;
  destinationId: string;
  currentNodeId?: string | null;
}

export const INITIAL_EXHIBIT_NAVIGATION: ExhibitNavigationState = {
  currentLocationId: "entrance",
  routeOriginId: "entrance",
  destinationId: "",
  currentNodeId: null,
};

interface ExhibitFloorMapViewProps {
  onSelectArtwork?: (artwork: ExhibitArtworkInfo) => void;
  navigationState?: ExhibitNavigationState;
  onNavigationStateChange?: (state: ExhibitNavigationState) => void;
  initialViewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  activeTourArtworkId?: string | null;
  completedArtworkIds?: string[];
}

type Point = [number, number];
const toCoordinate = (x: number, y: number): Point => [(x - 600) * 0.00005, (340 - y) * 0.00005];
type ExhibitWork = {
  id: string; title: string; artist: string; year: string; room: string;
  roomX: number; roomY: number; routeId: string;
  image: string; x: number; y: number; description: string; accessNode: string;
};
type AmenityKind = "information" | "restroom" | "accessible" | "stairs" | "elevator" | "cafe" | "shop" | "seat" | "water" | "exit";
type Amenity = {
  id: string; label: string; kind: AmenityKind; routeId?: string; x: number; y: number;
  accessNode: string; accessPath: Point[];
};
type Place = {
  id: string; label: string; x: number; y: number; accessNode: string;
  accessPath: Point[]; kind: "artwork" | AmenityKind;
};

const nodes: Record<string, Point> = {
  entrance: [90,335], west: [250,335], midwest: [470,335], center: [680,335], east: [900,335], farEast: [1100,335],
  lowerWest: [260,375], lowerCenter: [620,375], lowerEast: [930,375],
};
const edges: [string,string][] = [
  ["entrance","west"],["west","midwest"],["midwest","center"],["center","east"],["east","farEast"],
  ["west","lowerWest"],["midwest","lowerCenter"],["center","lowerCenter"],["east","lowerEast"],["farEast","lowerEast"],
  ["lowerWest","lowerCenter"],["lowerCenter","lowerEast"],
];
const works: ExhibitWork[] = [
  {
    id: "masaccio-holy-trinity",
    title: "The Holy Trinity",
    artist: "Masaccio",
    year: "1427",
    room: "Wing 1: Perspective",
    roomX: 220, roomY: 260, routeId: "perspective",
    image: "/artworks/masaccio-holy-trinity.jpg",
    x: 220,
    y: 205,
    accessNode: "west",
    description: "The foundational fresco of linear perspective, codifying Brunelleschi's mathematical grid with an open memento mori.",
  },
  {
    id: "caravaggio-calling-st-matthew",
    title: "The Calling of Saint Matthew",
    artist: "Caravaggio",
    year: "1600",
    room: "Wing 2: Shadow",
    roomX: 420, roomY: 260, routeId: "shadow",
    image: "/artworks/caravaggio-calling-st-matthew.jpg",
    x: 420,
    y: 205,
    accessNode: "midwest",
    description: "Tenebrism, street-level tavern realism, and divine raking light piercing through everyday corruption.",
  },
  {
    id: "van-gogh-starry-night",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    room: "Wing 3: Feeling",
    roomX: 600, roomY: 260, routeId: "feeling",
    image: "/artworks/van-gogh-starry-night.jpg",
    x: 600,
    y: 205,
    accessNode: "center",
    description: "Emotional expressionism and celestial vortices painted from the asylum window in Saint-Rémy.",
  },
  {
    id: "picasso-demoiselles",
    title: "Les Demoiselles d'Avignon",
    artist: "Pablo Picasso",
    year: "1907",
    room: "Wing 4: Cubism",
    roomX: 785, roomY: 260, routeId: "cubism",
    image: "/artworks/picasso-demoiselles.jpg",
    x: 785,
    y: 205,
    accessNode: "east",
    description: "Shattering 500 years of unified perspective into multiple simultaneous angles and Iberian masks.",
  },
  {
    id: "pollock-autumn-rhythm",
    title: "Autumn Rhythm (Number 30)",
    artist: "Jackson Pollock",
    year: "1950",
    room: "Wing 5: Concept",
    roomX: 995, roomY: 260, routeId: "concept",
    image: "/artworks/pollock-autumn-rhythm.jpg",
    x: 995,
    y: 205,
    accessNode: "farEast",
    description: "Action painting recording the kinetic trace of the artist's body in space across unstretched raw canvas.",
  },
  {
    id: "duchamp-fountain",
    title: "Fountain",
    artist: "Marcel Duchamp",
    year: "1917",
    room: "Archives & Rotunda",
    roomX: 245, roomY: 520, routeId: "rotunda",
    image: "/artworks/duchamp-fountain.jpg",
    x: 245,
    y: 465,
    accessNode: "lowerWest",
    description: "The revolutionary readymade that transformed art from visual craftsmanship into pure conceptual inquiry.",
  },
];

const amenities: Amenity[] = [
  { id:"information",label:"Information",kind:"information",routeId:"information",x:350,y:335,accessNode:"west",accessPath:[[250,335],[350,335]] },
  { id:"restrooms",label:"Restrooms",kind:"restroom",routeId:"restrooms",x:455,y:335,accessNode:"midwest",accessPath:[[470,335],[455,335]] },
  { id:"accessible-restroom",label:"Accessible Restroom",kind:"accessible",routeId:"accessible-restroom",x:560,y:335,accessNode:"midwest",accessPath:[[470,335],[535,335],[560,335]] },
  { id:"stairs",label:"Stairs",kind:"stairs",routeId:"stairs",x:135,y:405,accessNode:"west",accessPath:[[250,335],[220,335],[170,370],[135,405]] },
  { id:"elevator",label:"Elevator",kind:"elevator",routeId:"elevator",x:1040,y:405,accessNode:"farEast",accessPath:[[1100,335],[1080,370],[1040,405]] },
  { id:"seating",label:"Seating",kind:"seat",routeId:"seating",x:700,y:335,accessNode:"center",accessPath:[[680,335]] },
  { id:"water",label:"Drinking Water",kind:"water",routeId:"water",x:815,y:335,accessNode:"center",accessPath:[[680,335],[760,335],[815,335]] },
  { id:"cafe",label:"Café",kind:"cafe",routeId:"cafe",x:560,y:500,accessNode:"lowerCenter",accessPath:[[620,375],[600,420],[560,500]] },
  { id:"shop",label:"Museum Shop",kind:"shop",routeId:"shop",x:900,y:500,accessNode:"lowerEast",accessPath:[[930,375],[930,435],[900,500]] },
  { id:"main-entrance",label:"Main Entrance",kind:"exit",routeId:"entrance",x:90,y:335,accessNode:"entrance",accessPath:[[90,335]] },
  { id:"exit-east",label:"East Exit",kind:"exit",routeId:"exit-east",x:1125,y:335,accessNode:"farEast",accessPath:[[1100,335],[1125,335]] },
];
const roomLabels = works.map(({ room, roomX, roomY }) => ({ name: room, x: roomX, y: roomY }));
const places: Place[] = [
  { id:"entrance",label:"Main Entrance",x:90,y:335,accessNode:"entrance",accessPath:[[90,335]],kind:"exit" },
  ...works.map((work): Place => ({
    id:"art:"+work.id,label:work.title,x:work.x,y:work.y,accessNode:work.accessNode,
    accessPath:work.accessNode==="lowerWest"
      ? [[260,375],[250,390],[work.x,work.y]]
      : [[nodes[work.accessNode][0],nodes[work.accessNode][1]],[work.x,300],[work.x,270],[work.x,work.y]],
    kind:"artwork",
  })),
  ...amenities.map((amenity): Place => ({ id:`facility:${amenity.id}`,label:amenity.label,x:amenity.x,y:amenity.y,accessNode:amenity.accessNode,accessPath:amenity.accessPath,kind:amenity.kind })),
];

export function getExhibitRouteDestination(routeId: string): string | undefined {
  if (!routeId) return undefined;
  const norm = routeId.toLowerCase().trim().replace(/^facility:|^art:/, "");
  const artwork = works.find((work) => work.routeId.toLowerCase() === norm || work.id.toLowerCase() === norm);
  if (artwork) return `art:${artwork.id}`;
  const amenity = amenities.find(
    (place) =>
      place.id.toLowerCase() === norm ||
      (place.routeId && place.routeId.toLowerCase() === norm) ||
      (norm === "coffee" && place.kind === "cafe") ||
      (norm === "bathroom" && place.kind === "restroom") ||
      (norm === "toilets" && place.kind === "restroom") ||
      (norm === "lift" && place.kind === "elevator") ||
      (norm === "fountain" && place.kind === "water") ||
      (norm === "giftshop" && place.kind === "shop")
  );
  return amenity ? `facility:${amenity.id}` : undefined;
}

const mapStyle: MapLibreGL.StyleSpecification = {
  version:8,
  sources:{},
  layers:[{ id:"exhibit-background",type:"background",paint:{"background-color":"#fafafa"} }],
};

function addFloorLayers(map: MapLibreGL.Map) {
  if (map.getSource("exhibit-floorplan-image")) return;
  map.addSource("exhibit-floorplan-image", {
    type: "image",
    url: "/museum-floorplan-transparent.png",
    coordinates: [
      toCoordinate(40,40),
      toCoordinate(1180,40),
      toCoordinate(1180,660),
      toCoordinate(40,660),
    ],
  });
  map.addLayer({
    id: "exhibit-floorplan-image-layer",
    type: "raster",
    source: "exhibit-floorplan-image",
    paint: { "raster-fade-duration": 0 },
  });
  map.addSource("exhibit-route",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
  map.addLayer({id:"exhibit-route-casing",type:"line",source:"exhibit-route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#ffffff","line-width":9,"line-opacity":0.95}});
  map.addLayer({id:"exhibit-route-line",type:"line",source:"exhibit-route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#2458a6","line-width":5,"line-dasharray":[1.2,0.7]}});
}
function shortestPath(start:string,end:string): string[] {
  const distance:Record<string,number>={};
  const previous:Record<string,string|undefined>={};
  const remaining=new Set(Object.keys(nodes));
  for(const id of remaining) distance[id]=Infinity;
  distance[start]=0;
  while(remaining.size){
    let current:string|undefined;
    for(const id of remaining) if(current===undefined||distance[id]<distance[current]) current=id;
    if(current===undefined||distance[current]===Infinity) break;
    remaining.delete(current);
    if(current===end) break;
    for(const [a,b] of edges){
      const next=a===current?b:b===current?a:undefined;
      if(!next||!remaining.has(next)) continue;
      const from=nodes[current],to=nodes[next];
      const candidate=distance[current]+Math.hypot(to[0]-from[0],to[1]-from[1]);
      if(candidate<distance[next]){distance[next]=candidate;previous[next]=current;}
    }
  }
  if(start!==end&&!previous[end]) return [];
  const route=[end];
  let cursor=end;
  while(cursor!==start){const parent=previous[cursor];if(!parent)return [];route.unshift(parent);cursor=parent;}
  return route;
}

function buildRoute(state:ExhibitNavigationState): Point[] {
  if(!state.destinationId) return [];
  const destination=places.find((place)=>place.id===state.destinationId);
  const origin=state.routeOriginId==="current"
    ? state.currentNodeId ? {accessNode:state.currentNodeId,accessPath:[nodes[state.currentNodeId]]} : null
    : places.find((place)=>place.id===state.routeOriginId);
  if(!origin||!destination) return [];
  const nodeRoute=shortestPath(origin.accessNode,destination.accessNode);
  if(!nodeRoute.length) return [];
  const points=[...origin.accessPath].reverse();
  for(const id of nodeRoute.slice(1)) points.push(nodes[id]);
  points.push(...destination.accessPath.slice(1));
  return points.filter((point,index)=>index===0||point[0]!==points[index-1][0]||point[1]!==points[index-1][1]);
}

function artworkInfo(work:ExhibitWork): ExhibitArtworkInfo {
  return {
    id:work.id,title:work.title,imageSrc:work.image,summary:work.description,
    metadata:[{label:"Artist",value:work.artist},{label:"Date",value:work.year}],
  };
}

function AmenityIcon({kind,className=""}:{kind:AmenityKind;className?:string}) {
  const common={fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...common}>
    {kind==="information"&&<><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>}
    {kind==="restroom"&&<><circle cx="7" cy="4" r="1.6"/><circle cx="17" cy="4" r="1.6"/><path d="M5 8v5h4v8M19 8v5h-4v8M3 8h8m2 0h8"/></>}
    {kind==="accessible"&&<><circle cx="10" cy="4" r="1.6"/><path d="M9 8h4l2 4h4m-9-4-1 5 4 2 2 5m-6-8a5 5 0 1 0 5 5"/></>}
    {kind==="stairs"&&<path d="M3 19h5v-4h4v-4h4V7h5M3 22h18"/>}
    {kind==="elevator"&&<><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="m9 9 3-3 3 3m-6 6 3 3 3-3"/></>}
    {kind==="cafe"&&<><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Zm13 1h2a2.5 2.5 0 0 1 0 5h-2M3 22h16M8 5c-1-1 1-2 0-3m5 3c-1-1 1-2 0-3"/></>}
    {kind==="shop"&&<><path d="M4 8h16l1 13H3L4 8Zm4 0V6a4 4 0 1 1 8 0v2"/></>}
    {kind==="seat"&&<path d="M5 12V7h3v5h9V7h3v8H5v5m-2 0h18"/>}
    {kind==="water"&&<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>}
    {kind==="exit"&&<><path d="M14 3h6v18h-6M4 12h12m-5-5 5 5-5 5"/><path d="M4 5v14"/></>}
  </svg>;
}

export function ExhibitFloorMapView({
  onSelectArtwork,
  navigationState: controlledNavigationState,
  onNavigationStateChange: controlledNavigationChange,
  initialViewport,
  onViewportChange,
  activeTourArtworkId,
  completedArtworkIds,
}:ExhibitFloorMapViewProps) {
  const [mapInstance,setMapInstance]=React.useState<MapLibreGL.Map|null>(null);
  const [internalNavigation,setInternalNavigation]=React.useState<ExhibitNavigationState>(INITIAL_EXHIBIT_NAVIGATION);
  const navigationState=controlledNavigationState??internalNavigation;
  const onNavigationStateChange=controlledNavigationChange??setInternalNavigation;
  const mapViewport=initialViewport??{center:[-0.002,-0.001] as [number,number],zoom:14.1,pitch:0,bearing:0};


  const handleMapReady=React.useCallback((map:MapLibreGL.Map)=>{
    addFloorLayers(map);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    if (!initialViewport) {
      map.fitBounds(
        [toCoordinate(40,660),toCoordinate(1180,40)],
        {padding:map.getContainer().clientWidth<640?18:36,maxZoom:14.6,duration:0},
      );
    }
    setMapInstance(map);
  },[initialViewport]);
  const routePoints=React.useMemo(()=>buildRoute(navigationState),[navigationState]);
  React.useEffect(()=>{
    if(!mapInstance) return;
    const source=mapInstance.getSource("exhibit-route") as MapLibreGL.GeoJSONSource|undefined;
    if(!source) return;
    const coordinates=routePoints.map(([x,y])=>toCoordinate(x,y));
    source.setData(coordinates.length>1
      ? {type:"Feature",properties:{},geometry:{type:"LineString",coordinates}}
      : {type:"FeatureCollection",features:[]});
    if(routePoints.length>1){
      const minX=Math.min(...routePoints.map(([x])=>x)),maxX=Math.max(...routePoints.map(([x])=>x));
      const minY=Math.min(...routePoints.map(([,y])=>y)),maxY=Math.max(...routePoints.map(([,y])=>y));
      const compact=mapInstance.getContainer().clientWidth<640;
      mapInstance.fitBounds([toCoordinate(minX,maxY),toCoordinate(maxX,minY)],{
        padding:compact?{top:112,right:28,bottom:48,left:28}:{top:70,right:40,bottom:42,left:40},
        maxZoom:14.3,duration:550,
      });
    }
  },[mapInstance,navigationState.destinationId,routePoints]);

  const routeDestination=places.find((place)=>place.id===navigationState.destinationId);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-[#fafafa]">
      <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-[#fafafa]">
      <Map
        style={mapStyle}
        initialCenter={mapViewport.center}
        initialZoom={mapViewport.zoom}
        initialPitch={0}
        initialBearing={0}
        minZoom={10.5}
        maxPitch={0}
        onMapReady={handleMapReady}
        onViewportChange={onViewportChange??(()=>{})}
        className="h-full w-full"
      >
        {works.map((work)=>{
          const [longitude,latitude]=toCoordinate(work.x,work.y);
          const isActive = activeTourArtworkId === work.id;
          const isCompleted = completedArtworkIds?.includes(work.id);
          const ringClasses = isActive
            ? "border-white ring-[3px] ring-blue-600"
            : isCompleted
            ? "border-white ring-[3px] ring-emerald-600"
            : "border-white ring-2 ring-stone-300";

          return <MapMarker key={work.id} longitude={longitude} latitude={latitude} anchor="center">
            <button type="button" aria-label={`Preview ${work.title}; hear a brief teaser from Alba during the tour`} title={`Preview ${work.title} for a brief Alba teaser during the tour`} onClick={()=>onSelectArtwork?.(artworkInfo(work))} className="group relative flex size-[62px] items-center justify-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20211f]">
              <span className={`relative block size-[58px] overflow-hidden rounded-full border-[3px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110 group-focus-visible:scale-110 ${ringClasses}`}>
                <Image src={work.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
            </button>
          </MapMarker>;
        })}

        {roomLabels.map((room)=>{
          const [longitude,latitude]=toCoordinate(room.x,room.y);
          return <MapMarker key={room.name} longitude={longitude} latitude={latitude} anchor="center"><span aria-hidden="true" className="whitespace-nowrap text-xs font-semibold tracking-[0.02em] text-[#172027] [text-shadow:0_1px_2px_white,0_-1px_2px_white,1px_0_2px_white,-1px_0_2px_white]">{room.name}</span></MapMarker>;
        })}

        {amenities.map((amenity) => {
            const [longitude, latitude] = toCoordinate(amenity.x, amenity.y);
            const facilityId = `facility:${amenity.id}`;
            const isSelected = navigationState.destinationId === facilityId;
            return (
              <MapMarker key={amenity.id} longitude={longitude} latitude={latitude} anchor="center">
                <button
                  type="button"
                  aria-label={`Get directions to ${amenity.label}`}
                  title={`Directions to ${amenity.label}`}
                  onClick={() => {
                    const nextDest = isSelected ? "" : facilityId;
                    onNavigationStateChange({
                      ...navigationState,
                      routeOriginId: navigationState.currentLocationId || "entrance",
                      destinationId: nextDest,
                      currentLocationId: nextDest ? facilityId : (navigationState.currentLocationId || "entrance"),
                    });
                  }}
                  className={`group flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-left text-[#172027] transition-all cursor-pointer border ${
                    isSelected
                      ? "border-[#db4b3f] bg-white ring-2 ring-[#db4b3f]/30 shadow-sm"
                      : "border-transparent hover:border-[#d6d6d0] hover:bg-white hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#20211f]"
                  }`}
                >
                  <AmenityIcon kind={amenity.kind} className={`size-[21px] shrink-0 stroke-[2.1px] transition-transform ${isSelected ? "text-[#db4b3f]" : "group-hover:scale-110"}`} />
                  <span className="whitespace-nowrap px-0.5 text-[10px] font-medium leading-tight">{amenity.label}</span>
                </button>
              </MapMarker>
            );
          })}
        {routePoints.length>1&&<>
          {(() => {const [longitude,latitude]=toCoordinate(routePoints[0][0],routePoints[0][1]);return <MapMarker longitude={longitude} latitude={latitude} anchor="center"><span aria-label="Route starts here" className="block size-4 rounded-full border-[3px] border-white bg-[#2458a6] shadow-md"/></MapMarker>;})()}
          {routeDestination&&(()=>{const [longitude,latitude]=toCoordinate(routeDestination.x,routeDestination.y);return <MapMarker longitude={longitude} latitude={latitude} anchor="center"><span aria-label="Destination" className="block size-4 rounded-full border-[3px] border-white bg-[#db4b3f] shadow-md"/></MapMarker>;})()}
        </>}

        <MapControls show3D={false} showCompass={false} className="right-4 bottom-4" />
      </Map>

      </div>
    </div>
  );
}