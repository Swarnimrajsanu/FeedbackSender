
const UserPage = ({ params }: { params: { username: string } }) => {
  return (
    <div>
      <h1>User: {params.username}</h1>
    </div>
  );
};

export default UserPage;
