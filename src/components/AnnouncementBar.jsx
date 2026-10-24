import { useStore } from '../context/store';
export default function AnnouncementBar(){const {settings}=useStore();return settings?.announcement?<div className="announcement-bar" role="region" aria-label="Announcement">{settings.announcement}</div>:null;}
