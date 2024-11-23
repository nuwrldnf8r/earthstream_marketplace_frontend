const idlFactoryImages = ({ IDL }) => {
    const DownloadResult = IDL.Variant({
        'Ok' : IDL.Record({
        mime_type: IDL.Text,
        file: IDL.Vec(IDL.Nat8),
        }),
        'Err' : IDL.Text,
    });
    const FileId = IDL.Vec(IDL.Nat8);
    const UploadResult = IDL.Variant({ 'Ok' : FileId, 'Err' : IDL.Text });
    return IDL.Service({
        'get_file' : IDL.Func([IDL.Text], [DownloadResult], ['query']),
        'get_image_count' : IDL.Func([], [IDL.Nat64], ['query']),
        'upload_file' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Text], [UploadResult], []),
    });
};

const idlFactoryProjects = ({ IDL }) => {
  const GatewayType = IDL.Variant({ 'GSM' : IDL.Null, 'Wifi' : IDL.Null });
  const Location = IDL.Record({
    'lat' : IDL.Float64,
    'lng' : IDL.Float64,
    'geohash' : IDL.Text,
    'address' : IDL.Text,
  });
  const ProjectImages = IDL.Record({
    'background' : IDL.Text,
    'gallery' : IDL.Vec(IDL.Text),
  });
  const ProjectData = IDL.Record({
    'project_discord' : IDL.Opt(IDL.Text),
    'video' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'gateway_type' : GatewayType,
    'description' : IDL.Text,
    'sensors_required' : IDL.Nat32,
    'private_discord' : IDL.Text,
    'location' : Location,
    'images' : ProjectImages,
  });
  const ProjectStatus = IDL.Variant({
    'PendingReview' : IDL.Null,
    'Approved' : IDL.Null,
    'Suspended' : IDL.Null,
    'Rejected' : IDL.Null,
  });
  const Project = IDL.Record({
    'id' : IDL.Text,
    'status' : ProjectStatus,
    'project_discord' : IDL.Opt(IDL.Text),
    'featured_at' : IDL.Opt(IDL.Nat64),
    'featured' : IDL.Bool,
    'video' : IDL.Opt(IDL.Text),
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'gateway_type' : GatewayType,
    'description' : IDL.Text,
    'created_at' : IDL.Nat64,
    'sensors_required' : IDL.Nat32,
    'vote_count' : IDL.Nat64,
    'private_discord' : IDL.Text,
    'location' : Location,
    'images' : ProjectImages,
  });
  const ProjectsResponse = IDL.Record({
    'total' : IDL.Nat64,
    'projects' : IDL.Vec(Project),
    'page' : IDL.Nat32,
    'pages' : IDL.Nat32,
  });
  return IDL.Service({
    'add_admin' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'create_project' : IDL.Func(
        [ProjectData],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'create_super_admin' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'feature_project' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'get_all_tags' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'get_featured_projects' : IDL.Func(
        [IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_project' : IDL.Func([IDL.Text], [IDL.Opt(Project)], ['query']),
    'get_project_votes' : IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    'get_projects_by_date_range' : IDL.Func(
        [IDL.Nat64, IDL.Nat64, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_projects_by_gateway_type' : IDL.Func(
        [GatewayType, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_projects_by_ids' : IDL.Func(
        [IDL.Vec(IDL.Text), IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_projects_by_location' : IDL.Func(
        [IDL.Float64, IDL.Float64, IDL.Float64],
        [IDL.Vec(Project)],
        ['query'],
      ),
    'get_projects_by_owner' : IDL.Func(
        [IDL.Principal, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_projects_by_status' : IDL.Func(
        [ProjectStatus, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_projects_by_tag' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'get_projects_by_votes' : IDL.Func(
        [
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat32),
          IDL.Opt(IDL.Nat32),
        ],
        [ProjectsResponse],
        ['query'],
      ),
    'get_total_projects' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_total_votes' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_user_vote_for_project' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'get_user_voted_projects' : IDL.Func(
        [IDL.Principal, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'is_admin' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'is_super_admin' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'remove_admin' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'remove_vote' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'search_projects' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat32), IDL.Opt(IDL.Nat32)],
        [ProjectsResponse],
        ['query'],
      ),
    'unfeature_project' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_project' : IDL.Func(
        [IDL.Text, ProjectData],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_project_status' : IDL.Func(
        [IDL.Text, ProjectStatus],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'vote_for_project' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
  });
}; 

export const FACTORIES = {
    IMAGES: idlFactoryImages,
    PROJECTS: idlFactoryProjects
}

export const CANISTER_IDS = {
    IMAGES: "gguso-caaaa-aaaak-ao6qa-cai",
    //PURCHASE: "",
    PROJECTS: "gusfx-oqaaa-aaaak-ao6ta-cai"
}