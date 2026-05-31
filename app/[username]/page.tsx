import GithubContributionChart from '@/app/components/github-contribution-chart'

export default async function ChartEmbed({
  params,
}: {
  params: { username: string }
}) {
  const { username } = await params;
  return <GithubContributionChart username={username} />
}
