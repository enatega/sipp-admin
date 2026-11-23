import ProfileHeader from './header/ProfileHeader';
import ProfileDetail from './profile-detail/ProfileDetail';

const Profile = () => {
  return (
    <main>
      <section className="mb-6">
        <ProfileHeader />
      </section>
      <section>
        <ProfileDetail />
      </section>
    </main>
  );
};

export default Profile;
