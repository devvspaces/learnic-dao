import { Principal } from "@dfinity/principal";
import { Member } from "../declarations/dao/dao.did";

export interface Profile {
  principal: Principal,
  member: Member,
}