import Head from 'next/head'
import Chapter from '../../../../../../components/Chapters/Chapter';
import Pagination from '../../../../../../components/Pagination/Pagination';
import Tag from '../../../../../../components/Tag/Tag';
import { getAllPosts, getAllTags, getNumberOfPages, getNumberOfPagesByTag, getPostsByPage, getPostsByTagAndPage, getPostsTopPage } from '../../../../../../lib/notionAPI';

export const getStaticPaths = async () => {
  const allTags = await getAllTags();

  let params = [];

  await Promise.all(
    allTags.map((tag) => {
      return getNumberOfPagesByTag(tag).then((numberOfPagesByTag) => {
        for (let i = 1; i <= numberOfPagesByTag; i++) {
          params.push({ params: { tag: tag, page: i.toString() } })
        }
      });
    })
  );


  return {
    paths: params,
    fallback: "blocking",
  }
}

export const getStaticProps = async (context) => {
  const currentPage = context.params?.page.toString();
  const currentTag = context.params?.tag.toString();

  const upperCaseCurrentTag = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);

  const posts = await getPostsByTagAndPage(upperCaseCurrentTag, parseInt(currentPage, 10));

  const numberOfPagesByTag = await getNumberOfPagesByTag(upperCaseCurrentTag);

  const allTags = await getAllTags();

  return {
    props: {
      posts,
      numberOfPagesByTag,
      currentTag,
      allTags
    },
    revalidate: 60 * 60 * 12,
  }
}

const CurriculumTagPageList = ({ numberOfPagesByTag, posts, currentTag, allTags }) => {
  return (
    <>
      <Head>
        <title>VueCurriculum-Expert</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='container'>
        <h1 className='common_pageTitle'>VueCurriculum-Expert</h1>
        {posts.map((post) => (
          <div key={post.id}>
            <Chapter
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags}
              slug={post.slug}
              isPaginationPage={true}
            />
          </div>
        ))}
        <Pagination numberOfPage={numberOfPagesByTag} tag={currentTag} />
        <Tag tags={allTags} />
      </main>
    </>
  )
};

export default CurriculumTagPageList;
