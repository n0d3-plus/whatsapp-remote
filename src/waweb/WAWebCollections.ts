import type { IBaseCollection } from "./WAWebBaseCollection";
import type { IWAWebChatCollection } from "./WAWebChatCollection";
import type { IWAWebMsgCollection } from "./WAWebMsgCollection";

/**
 * WAWebCollections
 */
declare var WAWebCollections: {
  /** d("WAWebAdCollection").AdCollection */
  AdCollection: IBaseCollection
  /** d("WAWebBlocklistCollection").BlocklistCollection */
  Blocklist: IBaseCollection
  /** d("WAWebOptOutListCollection").OptOutListCollection */
  OptOutList: IBaseCollection
  /** d("WAWebBotProfileCollection").BotProfileCollection */
  BotProfile: IBaseCollection
  /** d("WAWebBusinessCategoriesResultCollection").BusinessCategoriesResultCollection */
  BusinessCategoryResult: IBaseCollection
  /** d("WAWebBusinessProfileCollection").BusinessProfileCollection */
  BusinessProfile: IBaseCollection
  /** c("WAWebCallCollection") */
  Call: IBaseCollection
  /** d("WAWebCatalogCollection").CatalogCollection */
  Catalog: IBaseCollection
  /** d("WAWebChatCollection").ChatCollection */
  Chat: IWAWebChatCollection
  /** d("WAWebChatAssignmentCollection").ChatAssignmentCollection */
  ChatAssignment: IBaseCollection
  /** c("WAWebChatPreferenceCollection") */
  ChatPreference: IBaseCollection
  /** d("WAWebContactCollection").ContactCollection */
  Contact: IBaseCollection
  /** c("WAWebConversionTupleCollection") */
  ConversionTuple: IBaseCollection
  /** d("WAWebDailyAggregatedStatsCollection").DailyAggregatedStatsCollection */
  DailyAggregatedStats: IBaseCollection
  /** d("WAWebEmojiVariantCollection").EmojiVariantCollection */
  EmojiVariant: IBaseCollection
  /** d("WAWebFavoriteCollection").FavoriteCollection */
  FavoriteCollection: IBaseCollection
  /** c("WAWebGroupMetadataCollection") */
  GroupMetadata: IBaseCollection
  /** d("WAWebLabelCollection").LabelCollection */
  Label: IBaseCollection
  /** d("WAWebMsgCollection").MsgCollection */
  Msg: IWAWebMsgCollection
  /** d("WAWebMsgInfoCollection").MsgInfoCollection */
  MsgInfo: IBaseCollection
  /** d("WAWebMuteCollection").MuteCollection */
  Mute: IBaseCollection
  /** d("WAWebOrderCollection").OrderCollection */
  Order: IBaseCollection
  /** d("WAWebPollsPollVoteCollection").PollVoteCollection */
  PollVote: IBaseCollection
  /** d("WAWebPresenceCollection").PresenceCollection */
  Presence: IBaseCollection
  /** d("WAWebProfilePicThumbCollection").ProfilePicThumbCollection */
  ProfilePicThumb: IBaseCollection
  /** d("WAWebQuickReplyCollection").QuickReplyCollection */
  QuickReply: IBaseCollection
  /** d("WAWebRecentEmojiCollection").RecentEmojiCollection */
  RecentEmoji: IBaseCollection
  /** d("WAWebRecentStickerCollection").RecentStickerCollection */
  RecentSticker: IBaseCollection
  /** d("WAWebStarredMsgCollection").AllStarredMsgsCollection */
  StarredMsg: IBaseCollection
  /** d("WAWebTextStatusCollection").TextStatusCollection */
  TextStatus: IBaseCollection
  /** d("WAWebStatusCollection").StatusCollection */
  Status: IBaseCollection
  /** d("WAWebStickerCollection").StickerCollection */
  Sticker: IBaseCollection
  /** d("WAWebStickerSearchCollection").StickerSearchCollection */
  StickerSearch: IBaseCollection
  /** d("WAWebRecentStickerCollectionMd").RecentStickerCollectionMd */
  RecentStickerMD: IBaseCollection
  /** d("WAWebStickerPackCollectionMd").StickerPackCollectionMd */
  StickerPackCollectionMD: IBaseCollection
  /** d("WAWebFavoriteStickerCollection").FavoriteStickerCollection */
  FavoriteSticker: IBaseCollection
  /** d("WAWebReactionsCollection").ReactionsCollection */
  Reactions: IBaseCollection
  /** d("WAWebRecentReactionsCollection").RecentReactionsCollection */
  RecentReactions: IBaseCollection
  /** c("WAWebUnjoinedSubgroupMetadataCollection" ) */
  UnjoinedSubgroupMetadataCollection: IBaseCollection
  /** d("WAWebAgentCollection").AgentCollection */
  AgentCollection: IBaseCollection
  /** d("WAWebSubscriptionCollection").SubscriptionCollection */
  SubscriptionCollection: IBaseCollection
  /** d("WAWebUnattributedMessageCollection").UnattributedMessageCollection */
  UnattributedMessageCollection: IBaseCollection
  /** c("WAWebCommunityActivityCollection") */
  CommunityActivityCollection: IBaseCollection
  /** d("WAWebCommentCollection").CommentCollection */
  CommentCollection: IBaseCollection
  /** d("WAWebPinInChatCollection").PinInChatCollection */
  PinInChat: IBaseCollection
  /** c("WAWebNewsletterCollection") */
  NewsletterCollection: IBaseCollection
  /** c("WAWebNewsletterMetadataCollection") */
  NewsletterMetadataCollection: IBaseCollection
  /** d("WAWebPremiumMessageCollection").PremiumMessageCollection */
  PremiumMessageCollection: IBaseCollection
  /** d("WAWebFlattenedReactionCollection").FlattenedReactionsCollection */
  FlattenedReactionsCollection: IBaseCollection
  /** d("WAWebUserDisclosureCollection").UserDisclosureCollection */
  UserDisclosureCollection: IBaseCollection
  /** d("WAWebEventResponseCollection").EventResponseCollection */
  EventResponseCollection: IBaseCollection
}
exports = WAWebCollections
export default WAWebCollections

/* From static.whatsapp.net/rsrc.php/YEqa75ZY8Wt.js
__d(
  "WAWebCollections",
  [
    "WAWebAdCollection",
    "WAWebAgentCollection",
    "WAWebBlocklistCollection",
    "WAWebBotProfileCollection",
    "WAWebBusinessCategoriesResultCollection",
    "WAWebBusinessProfileCollection",
    "WAWebCallCollection",
    "WAWebCatalogCollection",
    "WAWebChatAssignmentCollection",
    "WAWebChatCollection",
    "WAWebChatPreferenceCollection",
    "WAWebCommentCollection",
    "WAWebCommunityActivityCollection",
    "WAWebContactCollection",
    "WAWebConversionTupleCollection",
    "WAWebDailyAggregatedStatsCollection",
    "WAWebEmojiVariantCollection",
    "WAWebEventResponseCollection",
    "WAWebFavoriteCollection",
    "WAWebFavoriteStickerCollection",
    "WAWebFlattenedReactionCollection",
    "WAWebGroupMetadataCollection",
    "WAWebLabelCollection",
    "WAWebMsgCollection",
    "WAWebMsgInfoCollection",
    "WAWebMuteCollection",
    "WAWebNewsletterCollection",
    "WAWebNewsletterMetadataCollection",
    "WAWebOptOutListCollection",
    "WAWebOrderCollection",
    "WAWebPinInChatCollection",
    "WAWebPollsPollVoteCollection",
    "WAWebPremiumMessageCollection",
    "WAWebPresenceCollection",
    "WAWebProfilePicThumbCollection",
    "WAWebQuickReplyCollection",
    "WAWebReactionsCollection",
    "WAWebRecentEmojiCollection",
    "WAWebRecentReactionsCollection",
    "WAWebRecentStickerCollection",
    "WAWebRecentStickerCollectionMd",
    "WAWebStarredMsgCollection",
    "WAWebStatusCollection",
    "WAWebStickerCollection",
    "WAWebStickerPackCollectionMd",
    "WAWebStickerSearchCollection",
    "WAWebSubscriptionCollection",
    "WAWebTextStatusCollection",
    "WAWebUnattributedMessageCollection",
    "WAWebUnjoinedSubgroupMetadataCollection",
    "WAWebUserDisclosureCollection",
  ],
  function (a, b, c, d, e, f, g) {
    a = {
      AdCollection: d("WAWebAdCollection").AdCollection,
      Blocklist: d("WAWebBlocklistCollection").BlocklistCollection,
      OptOutList: d("WAWebOptOutListCollection").OptOutListCollection,
      BotProfile: d("WAWebBotProfileCollection").BotProfileCollection,
      BusinessCategoryResult: d("WAWebBusinessCategoriesResultCollection")
        .BusinessCategoriesResultCollection,
      BusinessProfile: d("WAWebBusinessProfileCollection")
        .BusinessProfileCollection,
      Call: c("WAWebCallCollection"),
      Catalog: d("WAWebCatalogCollection").CatalogCollection,
      Chat: d("WAWebChatCollection").ChatCollection,
      ChatAssignment: d("WAWebChatAssignmentCollection")
        .ChatAssignmentCollection,
      ChatPreference: c("WAWebChatPreferenceCollection"),
      Contact: d("WAWebContactCollection").ContactCollection,
      ConversionTuple: c("WAWebConversionTupleCollection"),
      DailyAggregatedStats: d("WAWebDailyAggregatedStatsCollection")
        .DailyAggregatedStatsCollection,
      EmojiVariant: d("WAWebEmojiVariantCollection").EmojiVariantCollection,
      FavoriteCollection: d("WAWebFavoriteCollection").FavoriteCollection,
      GroupMetadata: c("WAWebGroupMetadataCollection"),
      Label: d("WAWebLabelCollection").LabelCollection,
      Msg: d("WAWebMsgCollection").MsgCollection,
      MsgInfo: d("WAWebMsgInfoCollection").MsgInfoCollection,
      Mute: d("WAWebMuteCollection").MuteCollection,
      Order: d("WAWebOrderCollection").OrderCollection,
      PollVote: d("WAWebPollsPollVoteCollection").PollVoteCollection,
      Presence: d("WAWebPresenceCollection").PresenceCollection,
      ProfilePicThumb: d("WAWebProfilePicThumbCollection")
        .ProfilePicThumbCollection,
      QuickReply: d("WAWebQuickReplyCollection").QuickReplyCollection,
      RecentEmoji: d("WAWebRecentEmojiCollection").RecentEmojiCollection,
      RecentSticker: d("WAWebRecentStickerCollection").RecentStickerCollection,
      StarredMsg: d("WAWebStarredMsgCollection").AllStarredMsgsCollection,
      TextStatus: d("WAWebTextStatusCollection").TextStatusCollection,
      Status: d("WAWebStatusCollection").StatusCollection,
      Sticker: d("WAWebStickerCollection").StickerCollection,
      StickerSearch: d("WAWebStickerSearchCollection").StickerSearchCollection,
      RecentStickerMD: d("WAWebRecentStickerCollectionMd")
        .RecentStickerCollectionMd,
      StickerPackCollectionMD: d("WAWebStickerPackCollectionMd")
        .StickerPackCollectionMd,
      FavoriteSticker: d("WAWebFavoriteStickerCollection")
        .FavoriteStickerCollection,
      Reactions: d("WAWebReactionsCollection").ReactionsCollection,
      RecentReactions: d("WAWebRecentReactionsCollection")
        .RecentReactionsCollection,
      UnjoinedSubgroupMetadataCollection: c(
        "WAWebUnjoinedSubgroupMetadataCollection"
      ),
      AgentCollection: d("WAWebAgentCollection").AgentCollection,
      SubscriptionCollection: d("WAWebSubscriptionCollection")
        .SubscriptionCollection,
      UnattributedMessageCollection: d("WAWebUnattributedMessageCollection")
        .UnattributedMessageCollection,
      CommunityActivityCollection: c("WAWebCommunityActivityCollection"),
      CommentCollection: d("WAWebCommentCollection").CommentCollection,
      PinInChat: d("WAWebPinInChatCollection").PinInChatCollection,
      NewsletterCollection: c("WAWebNewsletterCollection"),
      NewsletterMetadataCollection: c("WAWebNewsletterMetadataCollection"),
      PremiumMessageCollection: d("WAWebPremiumMessageCollection")
        .PremiumMessageCollection,
      FlattenedReactionsCollection: d("WAWebFlattenedReactionCollection")
        .FlattenedReactionsCollection,
      UserDisclosureCollection: d("WAWebUserDisclosureCollection")
        .UserDisclosureCollection,
      EventResponseCollection: d("WAWebEventResponseCollection")
        .EventResponseCollection,
    };
    g["default"] = a;
  },
  98
);
*/