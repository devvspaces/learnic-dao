import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Types "types";
import Vector "mo:vector";
import Token "canister:token";

actor DAO {

  type Result<A, B> = Result.Result<A, B>;
  type Member = Types.Member;
  type ProposalContent = Types.ProposalContent;
  type ProposalId = Types.ProposalId;
  type Proposal = Types.Proposal;
  type Vote = Types.Vote;
  type HttpRequest = Types.HttpRequest;
  type HttpResponse = Types.HttpResponse;
  type Stats = Types.Stats;
  type ProjectId = Types.ProjectId;
  type Project = Types.Project;
  type SubmissionId = Types.SubmissionId;
  type Submission = Types.Submission;
  type Vector<T> = Vector.Vector<T>;

  stable var manifesto = "DAOs are the biggest innovation in the field of governance since the invention of the LLC or perhaps even democracy itself. Just like the steam engine made the Industrial Revolution possible by harnessing physical power, DAOs harness political power and make a Web3 revolution possible. This could fundamentally change how we organize resources, people and capital with the end goal of creating a more stable, flourishing, collaborative and fair civilisation.";
  stable let name = "LearnIC LMS DAO";

  stable var sMembers : [(Principal, Member)] = [];
  let members = HashMap.fromIter<Principal, Member>(sMembers.vals(), 0, Principal.equal, Principal.hash);

  stable var stableSubmissions: [(Principal, Vector<Submission>)] = [];
  let submissions = HashMap.fromIter<Principal, Vector<Submission>>(stableSubmissions.vals(), 0, Principal.equal, Principal.hash);

  stable let proposals = Vector.new<Proposal>();
  stable var nextProposalId : ProposalId = 0;

  stable let projects = Vector.new<Project>();
  stable var nextProjectId : ProjectId = 0;

  system func preupgrade() {
    sMembers := Iter.toArray(members.entries());
  };

  system func postupgrade() {
    sMembers := [];
  };

  // Returns the name of the DAO
  public query func getName() : async Text {
    return name;
  };

  // Returns the next proposal id
  public query func getNextProposalId() : async Nat {
    return nextProposalId;
  };

  // Returns the manifesto of the DAO
  public query func getManifesto() : async Text {
    return manifesto;
  };

  // Register a new member in the DAO with the given name and principal of the caller
  // Airdrop 10 MBC tokens to the new member
  // New members are always Student
  // Returns an error if the member already exists
  public shared ({ caller }) func registerMember(name : Text, github : Text) : async Result<(), Text> {
    switch (members.get(caller)) {
      case (null) {
        let member = {
          name = name;
          role = #Student;
          github = github;
        };
        members.put(caller, member);
        await Token.mint(caller, 10);
      };
      case (_) {
        return #err("Member already exist");
      };
    };
  };

  // Get the member with the given principal
  // Returns an error if the member does not exist
  public query func getMember(p : Principal) : async Result<Member, Text> {
    switch (members.get(p)) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?member) {
        #ok(member);
      };
    };
  };

  public query func getMembers() : async [(Principal, Member)] {
    Iter.toArray(members.entries());
  };

  // Returns all the projects
  public query func getAllProjects() : async [Project] {
    Vector.toArray(projects);
  };

  // Create a new project and returns its id
  // Returns an error if the caller is not a mentor
  public shared ({ caller }) func createProject(name : Text, url : Text) : async Result<ProjectId, Text> {
    switch (members.get(caller)) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?member) {
        if (member.role != #Mentor) {
          return #err("Only mentors can create a project");
        };
      };
    };

    let project : Project = {
      name = name;
      url = url;
      mentor = caller;
      created = Time.now();
    };

    nextProjectId += 1;
    Vector.add(projects, project);

    #ok(nextProjectId - 1);
  };

  // Get member submissions
  public query func getSubmissions(principal: Text) : async [Submission] {
    let caller = Principal.fromText(principal);
    switch (submissions.get(caller)) {
      case (null) {
        return [];
      };
      case (?sub) {
        Vector.toArray(sub);
      };
    };
  };

  // Count the number of submissions for the given member
  public query func countSubmissions(principal: Text) : async Nat {
    let caller = Principal.fromText(principal);
    switch (submissions.get(caller)) {
      case (null) {
        return 0;
      };
      case (?sub) {
        Vector.size(sub);
      };
    };
  };

  // Create a new submission
  // Returns an error if the caller is not a student
  public shared ({ caller }) func createSubmission(projectId : ProjectId, url : Text) : async Result<Nat, Text> {
    switch (members.get(caller)) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?member) {
        if (member.role != #Student) {
          return #err("Only students can create a submission");
        };
      };
    };

    if (projectId >= nextProjectId) {
      return #err("Project does not exist");
    };

    let submission : Submission = {
      project = projectId;
      url = url;
      created = Time.now();
    };

    switch (submissions.get(caller)) {
      case (null) {
        submissions.put(caller, Vector.new<Submission>());
      };
      case (?sub) {};
    };

    let memberSubmissions = submissions.get(caller);

    switch (memberSubmissions) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?sub) {
        Vector.add<Submission>(sub, submission);
        return #ok(Vector.size(sub) - 1);
      };
    };
  };

  // Graduate the student with the given principal
  // Returns an error if the student does not exist or is not a student
  // Returns an error if the caller is not a mentor
  public shared ({ caller }) func graduate(student : Principal) : async Result<(), Text> {
    switch (members.get(caller)) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?member) {
        if (member.role != #Mentor) {
          return #err("Only mentors can graduate a student");
        };
      };
    };
    switch (members.get(student)) {
      case (null) {
        return #err("Student does not exist");
      };
      case (?member) {
        switch (member.role) {
          case (#Student) {
            members.put(
              student,
              {
                name = member.name;
                role = #Graduate;
                github = member.github;
              },
            );
            return #ok();
          };
          case (_) {
            return #err("Member is not a student");
          };
        };
      };
    };
  };

  // Create a new proposal and returns its id
  // Returns an error if the caller is not a mentor or doesn't own at least 1 MBC token
  public shared ({ caller }) func createProposal(content : ProposalContent) : async Result<ProposalId, Text> {
    switch (members.get(caller)) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?member) {
        if (member.role != #Mentor) {
          return #err("Only mentors can create a proposal");
        };
      };
    };

    if ((await Token.balanceOf(caller)) < 1) {
      return #err("Insufficient funds");
    };

    switch (content) {
      case (#AddMentor(p)) {
        switch (members.get(p)) {
          case (null) {
            return #err("Member to become mentor does not exist");
          };
          case (?member) {
            switch (member.role) {
              case (#Graduate) {};
              case (_) {
                return #err("Only graduates can become a mentor");
              };
            };
          };
        };
      };
      case (_) {};
    };

    let proposal : Proposal = {
      content = content;
      creator = caller;
      created = Time.now();
      executed = null;
      votes = [];
      status = #Open;
    };

    nextProposalId += 1;
    Vector.add(proposals, proposal);

    let _ = await Token.burn(caller, 1);

    #ok(nextProposalId - 1);
  };

  // Get the proposal with the given id
  // Returns an error if the proposal does not exist
  public query func getProposal(id : ProposalId) : async Result<Proposal, Text> {
    if (id >= nextProposalId) {
      return #err("Proposal does not exist");
    };
    #ok(Vector.get(proposals, id));
  };

  // Returns all the proposals
  public query func getAllProposal() : async [Proposal] {
    Vector.toArray(proposals);
  };

  // Vote for the given proposal
  // Returns an error if the proposal does not exist or the member is not allowed to vote
  public shared ({ caller }) func voteProposal(proposalId : ProposalId, vote : Vote) : async Result<(), Text> {
    switch (members.get(vote.member)) {
      case (null) {
        return #err("Member does not exist");
      };
      case (?member) {
        switch (member.role) {
          case (#Student) {
            return #err("Student's are not allowed to vote");
          };
          case (_) {};
        };
      };
    };

    if (proposalId >= nextProposalId) {
      return #err("Proposal does not exist");
    };

    var proposal = Vector.get(proposals, proposalId);

    if (proposal.status != #Open) {
      return #err("Proposal is not open");
    };

    let voters = Buffer.fromArray<Vote>(proposal.votes);

    for (voter in voters.vals()) {
      if (voter.member == vote.member) {
        return #err("Member has already voted");
      };
    };

    voters.add(vote);
    var status = proposal.status;

    let principals = Iter.map(voters.vals(), func(x : Vote) : Principal { x.member });
    let balances = await Token.balanceOfArray(Iter.toArray(principals));

    var supporters = 0;
    var opponents = 0;

    var idx = 0;
    for (voter in voters.vals()) {
      if (voter.vote) {
        supporters += balances[idx];
      } else {
        opponents += balances[idx];
      };
      idx += 1;
    };

    var executed = proposal.executed;

    if (supporters >= 100) {
      status := #Accepted;
      switch (proposal.content) {
        case (#ChangeManifesto(t)) {
          manifesto := t;
        };
        case (#AddMentor(p)) {
          switch (members.get(p)) {
            case (null) {
              return #err("Member to become mentor does not exist");
            };
            case (?member) {
              switch (member.role) {
                case (#Graduate) {
                  members.put(
                    p,
                    {
                      name = member.name;
                      role = #Mentor;
                      github = member.github;
                    },
                  );
                };
                case (_) {
                  return #err("Only graduates can become a mentor");
                };
              };
            };
          };
        };
      };
      executed := ?Time.now();
    } else if (opponents >= 100) {
      status := #Rejected;
    };

    proposal := {
      content = proposal.content;
      creator = proposal.creator;
      created = proposal.created;
      executed = executed;
      votes = Buffer.toArray(voters);
      status = status;
    };

    #ok(Vector.put(proposals, proposalId, proposal));
  };

  // Returns the webpage of the DAO when called from the browser
  public query func http_request(request : HttpRequest) : async HttpResponse {
    return ({
      status_code = 200;
      headers = [("Content-Type", "text/html; charset=UTF-8")];
      body = Text.encodeUtf8(manifesto);
      streaming_strategy = null;
    });
  };

  public query func getStats() : async Stats {
    {
      name = name;
      numberOfMembers = members.size();
      manifesto = manifesto;
      socialLinkDAO = "https://x.com/netrobeweb";
      socialLinkBuilder = "https://x.com/netrobeweb";
      picture = "https://github.com/motoko-bootcamp/dao-adventure-training/blob/main/assets/README/cover.png?raw=true";
      logo = "https://global.discourse-cdn.com/business4/uploads/dfn/original/1X/88096d6782c2e395172166d097da5d86e738bbe5.png";
    };
  };

  // Initialize entities
  public shared ({ caller }) func init(name : Text, github : Text) : async (Result<(), Text>) {
    if (Principal.isAnonymous(caller)) {
      return #err("You must not be anonymous");
    };

    let mentor = Principal.fromText("gth2f-eyaaa-aaaaj-qa2pq-cai");
    members.put(
      mentor,
      {
        name = "mentor1";
        role = #Mentor;
        github = "https://github.com/dfinity";
      },
    );
    let _ = await Token.mint(mentor, 10);

    let student1 = Principal.fromText("4ey3h-nplzm-vyocb-xfjab-wwsos-ejl4y-27juy-qresy-emn7o-eczpl-pae");
    members.put(
      student1,
      {
        name = "Student1";
        role = #Student;
        github = "https://github.com/dfinity";
      },
    );
    let _ = await Token.mint(student1, 10);

    let student2 = Principal.fromText("im5mh-xqo25-qfehz-urydn-n7fpm-ylmaw-n6fld-h2xdx-46pcp-tcuti-eqe");
    members.put(
      student2,
      {
        name = "Student2";
        role = #Student;
        github = "https://github.com/dfinity";
      },
    );
    let _ = await Token.mint(student2, 10);

    members.put(
      caller,
      {
        name = name;
        role = #Student;
        github = github;
      },
    );
    let _ = await Token.mint(caller, 10);
  };

  public func becomeMentor(principal: Text) : async () {
    let caller = Principal.fromText(principal);
    switch (members.get(caller)) {
      case (null) {
        return;
      };
      case (?member) {
        members.put(
          caller,
          {
            name = member.name;
            role = #Mentor;
            github = member.github;
          },
        );
      };
    };
  };

};
