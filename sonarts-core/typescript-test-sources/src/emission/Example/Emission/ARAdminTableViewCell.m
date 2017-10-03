#import "ARAdminTableViewCell.h"
#import <Artsy_UIFonts/UIFont+ArtsyFonts.h>
#import <Artsy_UIColors/UIColor+ArtsyColors.h>

CGFloat ARTableViewCellSettingsHeight = 60;

@implementation ARAdminTableViewCell

CGFloat MainTextVerticalOffset = 4;
CGFloat DetailTextVerticalOffset = 6;

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (!self) {
        return nil;
    }

    self.useSerifFont = YES;
    UIView *backgroundView = [[UIView alloc] init];
    backgroundView.backgroundColor = [UIColor artsyGrayLight];
    self.selectedBackgroundView = backgroundView;
    self.textLabel.backgroundColor = [UIColor clearColor];

    return self;
}


- (void)setUseSerifFont:(BOOL)newUseSerifFont
{
    _useSerifFont = newUseSerifFont;

    if (_useSerifFont) {
        self.textLabel.font = [UIFont serifFontWithSize:18];
        self.detailTextLabel.font = [UIFont serifFontWithSize:18];
    } else {
        self.textLabel.font = [UIFont sansSerifFontWithSize:15];
        self.detailTextLabel.font = [UIFont sansSerifFontWithSize:15];
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];

    if (!self.detailTextLabel) {
        if (_useSerifFont) {
            CGRect frame = self.textLabel.frame;
            frame.size.height -= MainTextVerticalOffset;
            self.textLabel.frame = frame;
            self.textLabel.center = CGPointMake(self.textLabel.center.x, self.textLabel.center.y + MainTextVerticalOffset);
        }
    } else {
        self.detailTextLabel.center = CGPointMake(self.detailTextLabel.center.x, self.detailTextLabel.center.y + DetailTextVerticalOffset);
    }
}

@end
