import { type TweetEditControl } from './edit.ts'
import { type Indices, type TweetEntities } from './entities.ts'
import { type MediaDetails } from './media.ts'
import { type TweetPhoto } from './photo.ts'
import { type TweetUser } from './user.ts'
import { type TweetVideo } from './video.ts'

interface TweetBase {
	lang: string
	created_at: string
	display_text_range: Indices
	entities: TweetEntities
	id_str: string
	text: string
	user: TweetUser
	edit_control: TweetEditControl
	isEdited: boolean
	isStaleEdit: boolean
}

export interface Tweet extends TweetBase {
	__typename: 'Tweet'
	favorite_count: number
	mediaDetails?: MediaDetails[]
	photos?: TweetPhoto[]
	video?: TweetVideo
	conversation_count: number
	news_action_type: 'conversation'
	quoted_tweet?: QuotedTweet
	in_reply_to_screen_name?: string
	in_reply_to_status_id_str?: string
	in_reply_to_user_id_str?: string
	parent?: TweetParent
	possibly_sensitive?: boolean
}

export interface TweetParent extends TweetBase {
	reply_count: number
	retweet_count: number
	favorite_count: number
}

export interface QuotedTweet extends TweetBase {
	reply_count: number
	retweet_count: number
	favorite_count: number
	self_thread: {
		id_str: string
	}
}
