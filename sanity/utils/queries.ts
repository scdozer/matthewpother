import { gql, GraphQLClient } from "graphql-request";
import { Layout, Projects, RootQuery } from "./graphql";

const client = new GraphQLClient(
  "https://bxcwz78t.api.sanity.io/v2023-08-01/graphql/production/default"
);

export async function fetchSanityData<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  return client.request<T>(query, variables);
}

export const getLayout = gql`
  query getLayout {
    allLayout {
      _id
      title
      accoladesRaw
      address
      descriptionRaw
      email
      extraInfoRaw
      instagram
      phone
    }
  }
`;

export const getProjects = gql`
  query getProjects {
    allProjects {
      _id
      title
      slug {
        current
      }
      descriptionRaw
      image {
        asset {
          url
        }
      }
      type
    }
  }
`;

export const getSingleProject = gql`
  query getSingleProject($slug: String!) {
    allProjects(where: { slug: { current: { eq: $slug } } }) {
      _id
      title
      slug {
        current
      }
      descriptionRaw
      gallery {
        asset {
          url
        }
      }
      image {
        asset {
          url
        }
      }
      type
      video {
        asset {
          url
        }
      }
      videoEmbed
    }
  }
`;

export async function fetchLayout(): Promise<Layout> {
  const data = await fetchSanityData<RootQuery>(getLayout);
  return data.allLayout[0];
}

export async function fetchProjects(): Promise<Projects[]> {
  const data = await fetchSanityData<RootQuery>(getProjects);
  return data.allProjects;
}

export async function fetchSingleProject(
  slug: string
): Promise<Projects | null> {
  const data = await fetchSanityData<RootQuery>(getSingleProject, { slug });
  return data.allProjects[0] || null;
}
