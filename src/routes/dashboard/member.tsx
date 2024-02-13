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
} from '@chakra-ui/react';
import { useAuth } from '../../lib/AuthContext';
import { useEffect, useState } from 'react';
import { Member, Submission } from '../../declarations/dao/dao.did';
import { dao } from '../../declarations/dao';
import { token } from '../../declarations/token';
import { Principal } from '@dfinity/principal';
import { useLoaderData, useNavigation } from 'react-router-dom';
import { createClient } from '../../lib/helper';

export async function loader({ params }) {
  const member = await dao.getMember(Principal.fromText(params.id)) as { ok: Member };
  const submissions = await dao.getSubmissions(params.id);
  const balance = await token.balanceOf(Principal.fromText(params.id));
  const tokenSymbol = await token.tokenSymbol();
  return {
    member: member.ok,
    submissions,
    balance: balance.toString(),
    tokenSymbol,
    principal: params.id,
  };
}

export default function SingleMemberPage() {
  const { member, submissions, balance, tokenSymbol, principal } = useLoaderData();
  return (
    <Box>
      <Card mb={5} maxW={'lg'}>
        <CardBody>
          <Stack gap={3}>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={3}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Name
              </span>{' '}
              {member.name}
            </Text>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={3}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Principal
              </span>{' '}
              <span
                style={{
                  textAlign: 'right',
                }}
              >
                {principal}
              </span>
            </Text>
            <Text
              display={'flex'}
              align={'center'}
              justifyContent={'space-between'}
              gap={3}
            >
              <span
                style={{
                  fontWeight: 500,
                }}
              >
                Submissions
              </span>{' '}
              {submissions.length}
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
                Balance
              </span>{' '}
              {balance} {tokenSymbol}
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <TableContainer
        maxW={'3xl'}
        border={'1px'}
        borderColor={'gray.300'}
        rounded={'lg'}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>URL</Th>
              <Th>Project</Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((submission, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{submission.url}</Td>
                <Td>{submission.project.toString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {submissions.length === 0 && (
        <Text fontSize={'xl'} mt={5}>No submissions yet</Text>
      )}
    </Box>
  );
}
