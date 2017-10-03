#import <UIKit/UIKit.h>

@interface AROpaqueImageView : UIImageView
@property (nonatomic, strong, readwrite) NSURL *imageURL;
@property (nonatomic, strong, readwrite) UIColor *placeholderBackgroundColor;
@end
