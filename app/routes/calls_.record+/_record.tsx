import {
	json,
	type HeadersFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
import { BackLink } from '#app/components/arrow-button.tsx'
import { ButtonLink } from '#app/components/button.tsx'
import { Grid } from '#app/components/grid.tsx'
import { H2, Paragraph } from '#app/components/typography.tsx'
import { reuseUsefulLoaderHeaders } from '#app/utils/misc.tsx'
import { prisma } from '#app/utils/prisma.server.ts'
import { getUser } from '#app/utils/session.server.ts'
import { useRootData } from '#app/utils/use-root-data.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUser(request)
	const calls = user
		? await prisma.call.findMany({
				where: { userId: user.id },
				select: { id: true, title: true },
			})
		: []
	return json(
		{ calls },
		{
			headers: {
				'Cache-Control': 'private, max-age=3600',
				Vary: 'Cookie',
			},
		},
	)
}

export const headers: HeadersFunction = reuseUsefulLoaderHeaders

function MaybeOutlet({ open }: { open: boolean }) {
	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					variants={{
						collapsed: {
							height: 0,
							marginTop: 0,
							marginBottom: 0,
							opacity: 0,
						},
						expanded: {
							height: 'auto',
							marginTop: '1rem',
							marginBottom: '3rem',
							opacity: 1,
						},
					}}
					initial="collapsed"
					animate="expanded"
					exit="collapsed"
					transition={{ duration: 0.15 }}
					className="relative col-span-full"
				>
					<Outlet />
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}

function Record({
	active,
	title,
	slug,
}: {
	slug: string
	active: boolean
	title: string
}) {
	return (
		<Grid nested className="border-b border-gray-200 dark:border-gray-600">
			<Link
				to={active ? './' : slug}
				className="text-primary group relative col-span-full flex flex-col py-5 text-xl font-medium focus:outline-none"
			>
				<div className="bg-secondary absolute -inset-px -mx-6 hidden rounded-lg group-hover:block group-focus:block" />
				<span className="relative">{title}</span>
			</Link>
			<div className="col-span-full">
				<MaybeOutlet open={active} />
			</div>
		</Grid>
	)
}
export default function RecordScreen() {
	const { pathname } = useLocation()
	const { user } = useRootData()
	const data = useLoaderData<typeof loader>()

	const [activeSlug] = pathname.split('/').slice(-1)
	const calls = data.calls

	return (
		<>
			<Grid className="mb-10 mt-24 lg:mb-24">
				<BackLink
					to="/calls"
					className="col-span-full lg:col-span-8 lg:col-start-3"
				>
					{`Back to overview`}
				</BackLink>
			</Grid>

			<Grid as="header" className="mb-12">
				<H2 className="col-span-full lg:col-span-8 lg:col-start-3">
					{`Record your call, and I'll answer.`}
				</H2>
			</Grid>

			{user ? null : (
				<Grid>
					<div className="col-span-full lg:col-span-8 lg:col-start-3">
						<Paragraph className="mb-4">{`Please login to have your questions answered.`}</Paragraph>
						<ButtonLink to="/login">Login (or sign up)</ButtonLink>
					</div>
				</Grid>
			)}

			{user ? (
				<Grid as="main">
					<div className="col-span-full lg:col-span-8 lg:col-start-3">
						<Record
							slug="./new"
							active={activeSlug === 'new'}
							title="Make a new recording"
						/>
					</div>

					{calls.length > 0 ? (
						<ul className="col-span-full lg:col-span-8 lg:col-start-3">
							{calls.map((call) => (
								<li key={call.id}>
									<Record
										slug={`./${call.id}`}
										active={activeSlug === call.id}
										title={call.title}
									/>
								</li>
							))}
						</ul>
					) : null}
				</Grid>
			) : null}
		</>
	)
}
