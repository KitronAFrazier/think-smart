"use client";

import { useMemo, useState } from "react";

type Zone = {
  num: number;
  name: string;
  groups: number;
  teachers: number;
};

type CommunityZonesMapProps = {
  zones: Zone[];
};

function zoneToMapQuery(zone: Zone): string {
  return encodeURIComponent(`${zone.name}, Houston, TX`);
}

export default function CommunityZonesMap({ zones }: CommunityZonesMapProps) {
  const [activeZoneNum, setActiveZoneNum] = useState<number>(zones[0]?.num ?? 1);

  const activeZone = useMemo(
    () => zones.find((zone) => zone.num === activeZoneNum) ?? zones[0],
    [activeZoneNum, zones],
  );

  const mapSrc = useMemo(() => {
    if (!activeZone) {
      return "https://maps.google.com/maps?q=Houston%20TX&z=9&output=embed";
    }
    return `https://maps.google.com/maps?q=${zoneToMapQuery(activeZone)}&z=10&output=embed`;
  }, [activeZone]);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-header" style={{ marginBottom: 10 }}>
        <div className="section-title">Zones</div>
      </div>

      <div className="zones-map">
        <iframe
          title="Houston community zones map"
          src={mapSrc}
          className="zones-map-embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="tabs" style={{ marginTop: 12 }}>
        {zones.map((zone) => (
          <button
            key={zone.num}
            className={`tab ${activeZone?.num === zone.num ? "active" : ""}`}
            type="button"
            onClick={() => setActiveZoneNum(zone.num)}
          >
            Zone {zone.num}
          </button>
        ))}
      </div>

      {activeZone ? (
        <div className="card-sm" style={{ marginTop: 10, border: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <div className="zone-name">{activeZone.name}</div>
          <div className="zone-area">
            {activeZone.groups} groups · {activeZone.teachers} teachers
          </div>
        </div>
      ) : null}
    </div>
  );
}
