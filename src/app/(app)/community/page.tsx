import { Users } from "lucide-react";
import PlanGate from "@/components/app/PlanGate";
import CommunityZonesMap from "@/components/app/CommunityZonesMap";
import { getCurrentPlan } from "@/lib/current-plan";
import { getCommunityData } from "@/lib/server-data";

export default async function CommunityPage() {
  const currentPlan = await getCurrentPlan();
  const { groups, teachers, events, posts, zones } = await getCommunityData();

  return (
    <PlanGate requiredPlan="family" currentPlan={currentPlan}>
      <div className="page">
        <div className="page-header">
          <h1>Community Hub</h1>
          <p>Houston Metro Area · 60-mile radius from Downtown · 6 Zones</p>
        </div>

        <CommunityZonesMap zones={zones} />

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="section-header">
              <div className="section-title">Groups</div>
            </div>
            {groups.map((group) => (
              <div className="task-item" key={group.name}>
                <div style={{ flex: 1 }}>
                  <div className="task-text">{group.name}</div>
                  <div className="task-subject">
                    {group.meeting} · Zone {group.zone}
                  </div>
                </div>
                <span className="badge blue">{group.members} families</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-header">
              <div className="section-title">Teachers</div>
            </div>
            {teachers.map((teacher) => (
              <div className="task-item" key={teacher.name}>
                <div style={{ flex: 1 }}>
                  <div className="task-text">{teacher.name}</div>
                  <div className="task-subject">
                    Zone {teacher.zone} · {teacher.rate}
                  </div>
                </div>
                <span className={`badge ${teacher.verified ? "green" : "gold"}`}>{teacher.verified ? "Verified" : "Pending"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="section-header">
              <div className="section-title">Field Trips & Events</div>
            </div>
            {events.map((event) => (
              <div className="task-item" key={`${event.name}-${event.date}`}>
                <div style={{ flex: 1 }}>
                  <div className="task-text">{event.name}</div>
                  <div className="task-subject">
                    {event.date} · {event.cost}
                  </div>
                </div>
                <span className="badge gray">{event.type}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-header">
              <div className="section-title">Latest Community Posts</div>
            </div>
            {posts.length ? (
              posts.map((post) => (
                <div className="task-item" key={post.created_at}>
                  <div style={{ flex: 1 }}>
                    <div className="task-text">{post.title}</div>
                    <div className="task-subject">{post.body}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="icon">
                  <Users className="icon-svg" />
                </div>
                <p>No posts yet. Publish your first community update.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PlanGate>
  );
}
