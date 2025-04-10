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
      image {
        asset {
          url
          metadata {
            dimensions {
              width
              height
            }
            lqip
          }
        }
      }
    }
  }
`;

export const getProjects = gql`
  query getProjects {
    allProjects(sort: [{ type: ASC }, { _createdAt: DESC }]) {
      _id
      title
      slug {
        current
      }
      descriptionRaw
      year
      client
      image {
        asset {
          url
          metadata {
            dimensions {
              width
              height
            }
            lqip
          }
        }
      }
      mainVideo {
        asset {
          url
          originalFilename
        }
      }
      type
      featured
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
      year
      client
      gallery {
        ... on Image {
          asset {
            _type
            url
            metadata {
              dimensions {
                width
                height
              }
              lqip
            }
          }
        }
        ... on File {
          asset {
            _type
            url
            originalFilename
          }
        }
      }
      image {
        asset {
          url
          metadata {
            dimensions {
              width
              height
            }
            lqip
          }
        }
      }
      type
      video {
        asset {
          url
          originalFilename
        }
      }
      mainVideo {
        asset {
          url
          originalFilename
        }
      }
      videoEmbed
      featured
    }
  }
`;

export async function fetchLayout(): Promise<Layout> {
  const data = await fetchSanityData<RootQuery>(getLayout);
  return data.allLayout[0];
}

export async function fetchProjects(): Promise<Projects[]> {
  const data = await fetchSanityData<RootQuery>(getProjects);
  const typeOrder = ["narrative", "Docs", "musicVideo", "commercial", "stills"];
  return data.allProjects.sort(
    (a, b) => typeOrder.indexOf(a.type ?? "") - typeOrder.indexOf(b.type ?? "")
  );
}

export async function fetchSingleProject(
  slug: string
): Promise<Projects | null> {
  const data = await fetchSanityData<RootQuery>(getSingleProject, { slug });
  return data.allProjects[0] || null;
}
