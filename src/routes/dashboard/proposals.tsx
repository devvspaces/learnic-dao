import {
  Avatar,
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Input,
  HStack,
  Select,
  FormLabel,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Progress,
  FormControl,
  Textarea,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Link, useLoaderData } from 'react-router-dom';
import { dao } from '../../declarations/dao';
import { Proposal } from '../../declarations/dao/dao.did';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ProposalType,
  countProposalVotes,
  getProposalContent,
  getProposalStatus,
  getProposalString,
} from '../../lib/helper';
import { Principal } from '@dfinity/principal';
import { useState } from 'react';
import moment from 'moment';
import { useAuth } from '../../lib/AuthContext';

export async function proposalsLoader() {
  let proposals = await dao.getAllProposal();
  return {
    proposals,
  };
}

export default function ProposalsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
  } = useDisclosure();
  const { proposals } = useLoaderData() as { proposals: Proposal[] };
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null,
  );
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number>(0);

  const { state } = useAuth();

  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      manifesto: '',
      principal: '',
      type: '',
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Required'),
      manifesto: Yup.string(),
      principal: Yup.string(),
    }),
    validate: (values) => {
      const errors: any = {};
      if (
        values.type &&
        values.type !== ProposalType.ChangeManifesto.toString() &&
        values.type !== ProposalType.AddMentor.toString()
      ) {
        errors.type = 'Invalid proposal type';
      }
      if (
        !values.manifesto &&
        values.type === ProposalType.ChangeManifesto.toString()
      ) {
        errors.manifesto = 'You must provide a manifesto';
      }
      if (
        !values.principal &&
        values.type === ProposalType.AddMentor.toString()
      ) {
        errors.principal = 'You must provide a mentor principal';
      }
      if (
        values.principal &&
        values.type === ProposalType.AddMentor.toString()
      ) {
        try {
          Principal.fromText(values.principal);
        } catch (e) {
          errors.principal = 'Invalid principal';
        }
      }
      return errors;
    },
    onSubmit: async (values, { setFieldError }) => {
      try {
        let data = {
          [values.type]: values.manifesto,
        };
        if (values.type === ProposalType.AddMentor.toString()) {
          data = {
            [values.type]: Principal.fromText(values.principal),
          };
        }

        setIsLoading(true);
        const response = (await dao.createProposal(data as any)) as any;
        setIsLoading(false);
        if (response.ok !== undefined) {
          onCloseCreate();
          toast({
            title: 'Success.',
            description: 'Your proposal has been created successfully.',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
        } else {
          toast({
            title: 'An error occurred.',
            description: response.err,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
        }
      } catch (e: unknown) {
        toast({
          title: 'An error occurred.',
          description: (e as any).toString(),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top',
        });
      }
    },
  });

  return (
    <Box>
      <Button
        onClick={onOpenCreate}
        mb={5}
        colorScheme="blue"
        leftIcon={<AddIcon />}
      >
        Create New Proposal
      </Button>
      <TableContainer
        border={'1px'}
        borderColor={'gray.300'}
        rounded={'lg'}
        mx={'auto'}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Status</Th>
              <Th>Type</Th>
              <Th>Creator</Th>
              <Th>Created</Th>
              <Th>Approves</Th>
              <Th>Denies</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {proposals.map((proposal, index) => {
              return (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{getProposalStatus(proposal)}</Td>
                  <Td>{getProposalString(proposal)}</Td>
                  <Td>
                    <Text color="blue">
                      <Link
                        to={`/dashboard/members/${proposal.creator.toString()}`}
                      >
                        {proposal.creator.toString()}
                      </Link>
                    </Text>
                  </Td>
                  {/* <Td>Feb 19th, 2023 11:34 PM</Td> */}
                  <Td>
                    {moment(
                      new Date(parseInt(proposal.created.toString()) / 1000000),
                    ).format('MMM Do, YYYY h:mm A')}
                  </Td>
                  <Td>{countProposalVotes(proposal).approves}</Td>
                  <Td>{countProposalVotes(proposal).rejects}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size={'sm'}
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setSelectedId(index);
                        onOpen();
                      }}
                    >
                      Vote
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {proposals.length === 0 && (
        <Text fontSize={'xl'} mt={5}>
          No proposals available currently
        </Text>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedProposal && getProposalString(selectedProposal)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedProposal && (
              <Box>
                <Stack gap={3} mb={5}>
                  <Text
                    display={'flex'}
                    align={'center'}
                    justifyContent={'space-between'}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Creator
                    </span>{' '}
                    <Link
                      style={{
                        color: 'blue',
                      }}
                      to={`/dashboard/members/${selectedProposal.creator.toString()}`}
                    >
                      {selectedProposal.creator.toString()}
                    </Link>
                  </Text>
                  <Text
                    display={'flex'}
                    align={'center'}
                    justifyContent={'space-between'}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Created
                    </span>{' '}
                    {
                      moment(
                        new Date(
                          parseInt(selectedProposal.created.toString()) /
                            1000000,
                        ),
                      ).format('MMM Do, YYYY h:mm A')
                    }
                  </Text>
                  <Text
                    display={'flex'}
                    align={'center'}
                    justifyContent={'space-between'}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Status
                    </span>{' '}
                    <Badge colorScheme="green">{getProposalStatus(selectedProposal)}</Badge>
                  </Text>
                  <Text
                    display={'flex'}
                    align={'center'}
                    justifyContent={'space-between'}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Executed
                    </span>{' '}
                    {selectedProposal.executed.length == 1 && moment(
                      new Date(
                        parseInt(selectedProposal.executed[0].toString()) /
                          1000000,
                      ),
                    ).format('MMM Do, YYYY h:mm A')}
                  </Text>
                  <Text
                    display={'flex'}
                    align={'center'}
                    justifyContent={'space-between'}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Votes
                    </span>{' '}
                    {selectedProposal.votes.length}
                  </Text>
                </Stack>

                <FormLabel>Proposal</FormLabel>
                <Text bg={'gray.200'} p={3} rounded={'md'}>
                  {getProposalContent(selectedProposal)}
                </Text>

                <Box mt={5}>
                  <Text>Approves</Text>
                  <Progress
                    colorScheme="green"
                    max={100}
                    hasStripe
                    value={countProposalVotes(selectedProposal).approves}
                  />
                </Box>

                <Box mt={5}>
                  <Text>Declines</Text>
                  <Progress colorScheme="red" max={100} hasStripe value={countProposalVotes(selectedProposal).rejects} />
                </Box>

                <HStack mt={10}>
                  <Select onChange={(e) => {
                    setSelectedVote(e.target.value);
                  }} value={selectedVote ?? ''} placeholder="Select option">
                    <option value="approve">Approve</option>
                    <option value="deny">Deny</option>
                  </Select>
                  <Button onClick={async () => {
                    if (!selectedVote) {
                      toast({
                        title: 'An error occurred.',
                        description: 'You must select a vote.',
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                        position: 'top',
                      });
                      return;
                    }
                    setIsLoading(true);
                    const response = await dao.voteProposal(BigInt(selectedId), {
                      member: state.user?.principal as Principal,
                      vote: selectedVote === 'approve',
                    }) as any;
                    setIsLoading(false);
                    if (response.err) {
                      toast({
                        title: 'An error occurred.',
                        description: response.err,
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                        position: 'top',
                      });
                    } else {
                      toast({
                        title: 'Success.',
                        description: 'Your vote has been recorded.',
                        status: 'success',
                        duration: 9000,
                        isClosable: true,
                        position: 'top',
                      });
                    }
                  }} isLoading={isLoading} colorScheme="blue">Vote</Button>
                </HStack>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenCreate} onClose={onCloseCreate}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box>
              <form onSubmit={formik.handleSubmit}>
                <Stack gap={3} mb={5}>
                  <FormControl
                    id="type"
                    isInvalid={!!formik.errors.type && formik.touched.type}
                  >
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Select option"
                      name="type"
                    >
                      <option value={ProposalType.ChangeManifesto.toString()}>
                        Change Manifesto
                      </option>
                      <option value={ProposalType.AddMentor.toString()}>
                        Add Mentor
                      </option>
                    </Select>
                    <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
                  </FormControl>
                  {formik.values.type ===
                    ProposalType.ChangeManifesto.toString() && (
                    <FormControl
                      id="type"
                      isInvalid={
                        !!formik.errors.manifesto && formik.touched.manifesto
                      }
                    >
                      <FormLabel>New Manifesto</FormLabel>
                      <Textarea
                        value={formik.values.manifesto}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        name="manifesto"
                      />
                      <FormErrorMessage>
                        {formik.errors.manifesto}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                  {formik.values.type === ProposalType.AddMentor.toString() && (
                    <FormControl
                      id="type"
                      isInvalid={
                        !!formik.errors.principal && formik.touched.principal
                      }
                    >
                      <FormLabel>Mentor Principal</FormLabel>
                      <Input
                        value={formik.values.principal}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        name="principal"
                      />
                      <FormErrorMessage>
                        {formik.errors.principal}
                      </FormErrorMessage>
                    </FormControl>
                  )}

                  <Button
                    isLoading={isLoading}
                    type="submit"
                    colorScheme="blue"
                  >
                    Create Proposal
                  </Button>
                </Stack>
              </form>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
